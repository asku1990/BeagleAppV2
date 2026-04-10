// Resolves profile siblings from one reliably identified birth litter and maps
// sibling rows to the same shape used by litter puppy rows.
import {
  getBusinessDateUtcRange,
  toBusinessDateOnly,
} from "@db/core/date-only";
import { getPrimaryRegistrationNo, toSexCode } from "./profile-mappers";
import type {
  BeagleDogProfileSiblingRowDb,
  BeagleDogProfileSiblingsSummaryDb,
  OffspringDogNode,
  OffspringLitterParentNode,
  OffspringLitterRelationNode,
  ParentDogNode,
  RegistrationNode,
} from "./profile-types";

type ParentRef = {
  id: string | null;
  registrationNo: string | null;
};

export type SiblingProfileContext = {
  id: string;
  birthDate: Date;
  sire: ParentRef;
  dam: ParentRef;
};

function hasUsableRegistrationNo(registrations: RegistrationNode[]): boolean {
  return getPrimaryRegistrationNo(registrations) !== "-";
}

function getParentRef(parent: ParentDogNode | null): ParentRef {
  if (!parent) {
    return { id: null, registrationNo: null };
  }

  return {
    id: parent.id || null,
    registrationNo: hasUsableRegistrationNo(parent.registrations)
      ? getPrimaryRegistrationNo(parent.registrations)
      : null,
  };
}

export function createSiblingProfileContext(profile: {
  id: string;
  birthDate: Date | null;
  sire: ParentDogNode | null;
  dam: ParentDogNode | null;
}): SiblingProfileContext | null {
  if (!profile.birthDate) {
    return null;
  }

  const sire = getParentRef(profile.sire);
  const dam = getParentRef(profile.dam);
  const isReliable =
    (sire.id || sire.registrationNo) && (dam.id || dam.registrationNo);
  if (!isReliable) {
    return null;
  }

  return {
    id: profile.id,
    birthDate: profile.birthDate,
    sire,
    dam,
  };
}

export function buildSiblingWhere(
  context: SiblingProfileContext,
): Record<string, unknown> {
  const birthDateRange = getBusinessDateUtcRange(context.birthDate);

  return {
    id: { not: context.id },
    // Match by Helsinki calendar day to avoid missing siblings with different
    // legacy timestamp times on the same birth date.
    birthDate: {
      gte: birthDateRange.start,
      lt: birthDateRange.endExclusive,
    },
    ...(context.sire.id
      ? { sireId: context.sire.id }
      : {
          sire: {
            registrations: {
              some: {
                registrationNo: context.sire.registrationNo,
              },
            },
          },
        }),
    ...(context.dam.id
      ? { damId: context.dam.id }
      : {
          dam: {
            registrations: {
              some: {
                registrationNo: context.dam.registrationNo,
              },
            },
          },
        }),
  };
}

function getBirthDateKey(value: Date | null): string {
  return value ? toBusinessDateOnly(value) : "unknown-date";
}

function getOffspringLitterParentKey(
  parent: OffspringLitterParentNode | null,
): string {
  if (!parent) {
    return "unknown";
  }
  const registrationNo = getPrimaryRegistrationNo(parent.registrations);
  return parent.id || (registrationNo !== "-" ? registrationNo : "unknown");
}

function getLitterGroupKey(
  puppyId: string,
  birthDate: Date | null,
  otherParentKey: string,
): string {
  const birthDateKey = getBirthDateKey(birthDate);
  if (birthDateKey === "unknown-date" || otherParentKey === "unknown") {
    return `unknown-offspring:${otherParentKey}:${puppyId}`;
  }
  return `${birthDateKey}:${otherParentKey}`;
}

function getOffspringLitterCandidates(
  whelpedPuppies: OffspringLitterRelationNode[],
  siredPuppies: OffspringLitterRelationNode[],
): Array<{
  puppy: OffspringLitterRelationNode;
  otherParent: OffspringLitterParentNode | null;
}> {
  const deduped = new Map<
    string,
    {
      puppy: OffspringLitterRelationNode;
      otherParent: OffspringLitterParentNode | null;
    }
  >();

  for (const puppy of whelpedPuppies) {
    deduped.set(puppy.id, { puppy, otherParent: puppy.sire });
  }
  for (const puppy of siredPuppies) {
    const existing = deduped.get(puppy.id);
    if (!existing || existing.otherParent == null) {
      deduped.set(puppy.id, { puppy, otherParent: puppy.dam });
    }
  }

  return [...deduped.values()];
}

function countOffspringLitters(puppy: OffspringDogNode): number {
  const litterKeys = new Set<string>();
  for (const candidate of getOffspringLitterCandidates(
    puppy.whelpedPuppies,
    puppy.siredPuppies,
  )) {
    litterKeys.add(
      getLitterGroupKey(
        candidate.puppy.id,
        candidate.puppy.birthDate,
        getOffspringLitterParentKey(candidate.otherParent),
      ),
    );
  }
  return litterKeys.size;
}

function mapSiblingRow(dog: OffspringDogNode): BeagleDogProfileSiblingRowDb {
  return {
    id: dog.id,
    dogId: dog.id,
    name: dog.name,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
    sex: toSexCode(dog.sex),
    ekNo: dog.ekNo ?? null,
    trialCount: dog._count.trialResults,
    showCount: dog._count.showEntries,
    litterCount: countOffspringLitters(dog),
  };
}

function compareSiblingRows(
  left: BeagleDogProfileSiblingRowDb,
  right: BeagleDogProfileSiblingRowDb,
): number {
  const registrationOrder = left.registrationNo.localeCompare(
    right.registrationNo,
    "fi",
    { sensitivity: "base" },
  );
  if (registrationOrder !== 0) {
    return registrationOrder;
  }

  return left.name.localeCompare(right.name, "fi", { sensitivity: "base" });
}

export function buildSiblings(
  candidates: OffspringDogNode[],
): BeagleDogProfileSiblingRowDb[] {
  return candidates.map(mapSiblingRow).sort(compareSiblingRows);
}

export function buildSiblingsSummary(
  siblings: BeagleDogProfileSiblingRowDb[],
): BeagleDogProfileSiblingsSummaryDb {
  return { siblingCount: siblings.length };
}
