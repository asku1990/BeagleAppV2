import { type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import {
  getWildcardProbe,
  hasWildcard,
  matchesLike,
  normalizeQuery,
  resolvePrimaryRegistrationNo,
  type RawVirtualPairingDogRow,
  type VirtualPairingSearchFieldDb,
} from "./search-helpers";

// Virtual-pairing search execution helpers: query shape, ordering, loading, and
// in-memory filtering for the capped wildcard path.

export function buildBroadWhere(input: {
  field: VirtualPairingSearchFieldDb;
  query: string;
}): Prisma.DogWhereInput | null {
  const query = normalizeQuery(input.query);
  if (!query) {
    return null;
  }

  if (input.field === "ek") {
    if (hasWildcard(query)) {
      return { ekNo: { not: null } };
    }
    const parsed = Number.parseInt(query, 10);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return { ekNo: parsed };
  }

  if (input.field === "reg") {
    if (hasWildcard(query)) {
      const probe = getWildcardProbe(query);
      return probe
        ? {
            registrations: {
              some: {
                registrationNo: {
                  contains: probe,
                  mode: "insensitive",
                },
              },
            },
          }
        : null;
    }

    return {
      registrations: {
        some: {
          registrationNo: {
            equals: query.toUpperCase(),
            mode: "insensitive",
          },
        },
      },
    };
  }

  if (hasWildcard(query)) {
    const probe = getWildcardProbe(query);
    return probe
      ? {
          name: {
            contains: probe,
            mode: "insensitive",
          },
        }
      : null;
  }

  return {
    name: {
      contains: query,
      mode: "insensitive",
    },
  };
}

export function buildBoundedWhere(input: {
  field: VirtualPairingSearchFieldDb;
  query: string;
}): Prisma.DogWhereInput | null {
  const query = normalizeQuery(input.query);
  if (!query) {
    return null;
  }

  if (input.field === "ek") {
    if (hasWildcard(query)) {
      return null;
    }

    const parsed = Number.parseInt(query, 10);
    if (!Number.isFinite(parsed) || String(parsed) !== query) {
      return null;
    }

    return { ekNo: parsed };
  }

  if (input.field === "reg") {
    if (hasWildcard(query)) {
      return null;
    }

    return {
      registrations: {
        some: {
          registrationNo: {
            equals: query.toUpperCase(),
            mode: "insensitive",
          },
        },
      },
    };
  }

  if (hasWildcard(query)) {
    return null;
  }

  return {
    name: {
      contains: query,
      mode: "insensitive",
    },
  };
}

export function resolveBoundedOrderBy(
  field: VirtualPairingSearchFieldDb,
): Prisma.DogOrderByWithRelationInput[] {
  if (field === "ek") {
    return [{ ekNo: "asc" }, { name: "asc" }, { id: "asc" }];
  }

  return [{ name: "asc" }, { id: "asc" }];
}

export function resolveBroadOrderBy(
  field: VirtualPairingSearchFieldDb,
): Prisma.DogOrderByWithRelationInput[] {
  if (field === "ek") {
    return [{ ekNo: "asc" }, { id: "asc" }];
  }

  return [{ name: "asc" }, { id: "asc" }];
}

export async function loadVirtualPairingDogs(
  args: Pick<
    Prisma.DogFindManyArgs,
    "where" | "orderBy" | "skip" | "take" | "select"
  >,
): Promise<RawVirtualPairingDogRow[]> {
  return (await prisma.dog.findMany(
    args,
  )) as unknown as RawVirtualPairingDogRow[];
}

export function matchesField(
  row: RawVirtualPairingDogRow,
  field: VirtualPairingSearchFieldDb,
  query: string,
): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) return false;

  if (field === "ek") {
    const value = row.ekNo == null ? "" : String(row.ekNo);
    return hasWildcard(normalized)
      ? matchesLike(value, normalized)
      : value === normalized;
  }

  if (field === "reg") {
    return row.registrations.some((registration) =>
      hasWildcard(normalized)
        ? matchesLike(registration.registrationNo, normalized)
        : registration.registrationNo.toUpperCase() ===
          normalized.toUpperCase(),
    );
  }

  return hasWildcard(normalized)
    ? matchesLike(row.name, normalized)
    : row.name.toLowerCase().includes(normalized.toLowerCase());
}

export function compareRows(
  left: RawVirtualPairingDogRow,
  right: RawVirtualPairingDogRow,
  field: VirtualPairingSearchFieldDb,
): number {
  if (field === "name") {
    const nameComparison = left.name.localeCompare(right.name, "fi", {
      sensitivity: "base",
    });
    if (nameComparison !== 0) return nameComparison;
    const leftReg = resolvePrimaryRegistrationNo(left.registrations);
    const rightReg = resolvePrimaryRegistrationNo(right.registrations);
    return leftReg.localeCompare(rightReg, "fi", { sensitivity: "base" });
  }

  if (field === "reg") {
    const leftReg = resolvePrimaryRegistrationNo(left.registrations);
    const rightReg = resolvePrimaryRegistrationNo(right.registrations);
    return leftReg.localeCompare(rightReg, "fi", { sensitivity: "base" });
  }

  const leftEk = left.ekNo ?? Number.MAX_SAFE_INTEGER;
  const rightEk = right.ekNo ?? Number.MAX_SAFE_INTEGER;
  if (leftEk !== rightEk) {
    return leftEk - rightEk;
  }
  return left.name.localeCompare(right.name, "fi", { sensitivity: "base" });
}
