// Groups dog profile offspring into litters using birth date and co-parent identity.
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
  ParentDogNode,
} from "./profile-types";

type OffspringCandidate = {
  puppy: OffspringDogNode;
  otherParent: ParentDogNode | null;
};

function createOffspringCandidate(
  puppy: OffspringDogNode,
  otherParent: ParentDogNode | null,
): OffspringCandidate {
  return { puppy, otherParent };
}

function getOffspringCandidates(
  sex: BeagleDogProfileSexDb,
  whelpedPuppies: OffspringDogNode[],
  siredPuppies: OffspringDogNode[],
): OffspringCandidate[] {
  if (sex === "N") {
    return whelpedPuppies.map((puppy) =>
      createOffspringCandidate(puppy, puppy.sire),
    );
  }

  if (sex === "U") {
    return siredPuppies.map((puppy) =>
      createOffspringCandidate(puppy, puppy.dam),
    );
  }

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
  return value ? value.toISOString().slice(0, 10) : "unknown-date";
}

function getOtherParentKey(parent: BeagleDogProfileParentDb | null): string {
  return parent?.id ?? parent?.registrationNo ?? "unknown";
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
  };
}

export function buildLitters(
  dogId: string,
  sex: BeagleDogProfileSexDb,
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
    sex,
    whelpedPuppies,
    siredPuppies,
  )) {
    const otherParent = mapParent(candidate.otherParent);
    const birthDateKey = getBirthDateKey(candidate.puppy.birthDate);
    const key = `${birthDateKey}:${getOtherParentKey(otherParent)}`;
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
