// Groups dog profile offspring into litters using birth date and co-parent identity.
import { toBusinessDateOnly } from "../../../core/date-only";
import {
  getPrimaryRegistrationNo,
  mapParent,
  toSexCode,
} from "./profile-mappers";
import type {
  BeagleDogProfileLitterDb,
  BeagleDogProfileOffspringRowDb,
  BeagleDogProfileOffspringSummaryDb,
  BeagleDogProfileParentDb,
  BeagleDogProfileSexDb,
  OffspringDogNode,
  OffspringLitterParentNode,
  OffspringLitterRelationNode,
  ParentDogNode,
} from "./profile-types";

type OffspringCandidate = {
  puppy: OffspringDogNode;
  otherParent: ParentDogNode | null;
};

type OffspringLitterCandidate = {
  puppy: OffspringLitterRelationNode;
  otherParent: OffspringLitterParentNode | null;
};

function createOffspringCandidate(
  puppy: OffspringDogNode,
  otherParent: ParentDogNode | null,
): OffspringCandidate {
  return { puppy, otherParent };
}

function createOffspringLitterCandidate(
  puppy: OffspringLitterRelationNode,
  otherParent: OffspringLitterParentNode | null,
): OffspringLitterCandidate {
  return { puppy, otherParent };
}

function getOffspringCandidates(
  whelpedPuppies: OffspringDogNode[],
  siredPuppies: OffspringDogNode[],
): OffspringCandidate[] {
  const deduped = new Map<string, OffspringCandidate>();
  for (const puppy of whelpedPuppies) {
    deduped.set(puppy.id, createOffspringCandidate(puppy, puppy.sire));
  }
  for (const puppy of siredPuppies) {
    const existing = deduped.get(puppy.id);
    if (!existing || existing.otherParent == null) {
      deduped.set(puppy.id, createOffspringCandidate(puppy, puppy.dam));
    }
  }

  return [...deduped.values()];
}

function getOffspringLitterCandidates(
  whelpedPuppies: OffspringLitterRelationNode[],
  siredPuppies: OffspringLitterRelationNode[],
): OffspringLitterCandidate[] {
  const deduped = new Map<string, OffspringLitterCandidate>();
  for (const puppy of whelpedPuppies) {
    deduped.set(puppy.id, createOffspringLitterCandidate(puppy, puppy.sire));
  }
  for (const puppy of siredPuppies) {
    const existing = deduped.get(puppy.id);
    if (!existing || existing.otherParent == null) {
      deduped.set(puppy.id, createOffspringLitterCandidate(puppy, puppy.dam));
    }
  }

  return [...deduped.values()];
}

function compareNullableDatesDesc(a: Date | null, b: Date | null): number {
  if (a && b) {
    return b.getTime() - a.getTime();
  }
  if (a) {
    return -1;
  }
  if (b) {
    return 1;
  }
  return 0;
}

function compareOffspringRows(
  left: BeagleDogProfileOffspringRowDb,
  right: BeagleDogProfileOffspringRowDb,
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

function getBirthDateKey(value: Date | null): string {
  return value ? toBusinessDateOnly(value) : "unknown-date";
}

function getOtherParentKey(parent: BeagleDogProfileParentDb | null): string {
  return parent?.id ?? parent?.registrationNo ?? "unknown";
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

// Keep sparse legacy rows isolated instead of inventing sibling relationships
// when the litter date is missing, because repeated matings for the same pair
// are possible in legacy data and cannot be disambiguated safely.
function getLitterGroupKey(
  puppyId: string,
  birthDate: Date | null,
  otherParentKey: string,
): string {
  const birthDateKey = getBirthDateKey(birthDate);
  if (birthDateKey === "unknown-date") {
    return `unknown-offspring:${otherParentKey}:${puppyId}`;
  }

  return `${birthDateKey}:${otherParentKey}`;
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

function mapOffspringRow(
  puppy: OffspringDogNode,
): BeagleDogProfileOffspringRowDb {
  return {
    id: puppy.id,
    dogId: puppy.id,
    name: puppy.name,
    registrationNo: getPrimaryRegistrationNo(puppy.registrations),
    sex: toSexCode(puppy.sex),
    ekNo: puppy.ekNo ?? null,
    trialCount: puppy._count.trialResults,
    showCount: puppy._count.showResults,
    litterCount: countOffspringLitters(puppy),
  };
}

export function buildLitters(
  dogId: string,
  _sex: BeagleDogProfileSexDb,
  whelpedPuppies: OffspringDogNode[],
  siredPuppies: OffspringDogNode[],
): BeagleDogProfileLitterDb[] {
  const groups = new Map<
    string,
    {
      birthDate: Date | null;
      otherParent: BeagleDogProfileParentDb | null;
      puppies: BeagleDogProfileOffspringRowDb[];
    }
  >();

  for (const candidate of getOffspringCandidates(
    whelpedPuppies,
    siredPuppies,
  )) {
    const otherParent = mapParent(candidate.otherParent);
    const key = getLitterGroupKey(
      candidate.puppy.id,
      candidate.puppy.birthDate,
      getOtherParentKey(otherParent),
    );
    const group = groups.get(key) ?? {
      birthDate: candidate.puppy.birthDate,
      otherParent,
      puppies: [],
    };

    group.puppies.push(mapOffspringRow(candidate.puppy));
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([groupKey, group]) => ({
      id: `${dogId}:${groupKey}`,
      birthDate: group.birthDate,
      otherParent: group.otherParent,
      puppyCount: group.puppies.length,
      puppies: [...group.puppies].sort(compareOffspringRows),
    }))
    .sort((left, right) => {
      const dateOrder = compareNullableDatesDesc(
        left.birthDate,
        right.birthDate,
      );
      if (dateOrder !== 0) {
        return dateOrder;
      }

      return getOtherParentKey(left.otherParent).localeCompare(
        getOtherParentKey(right.otherParent),
        "fi",
        { sensitivity: "base" },
      );
    });
}

export function buildOffspringSummary(
  litters: BeagleDogProfileLitterDb[],
): BeagleDogProfileOffspringSummaryDb {
  return {
    litterCount: litters.length,
    puppyCount: litters.reduce((total, litter) => total + litter.puppyCount, 0),
  };
}
