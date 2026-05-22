import { type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import {
  getWildcardProbe,
  hasWildcard,
  normalizeQuery,
  parsePage,
  parsePageSize,
  resolvePrimaryRegistrationNo,
  matchesLike,
  toSexCode,
  type RawVirtualPairingDogRow,
  type VirtualPairingSearchDogRowDb,
  type VirtualPairingSearchFieldDb,
  type VirtualPairingSearchRequestDb,
  type VirtualPairingSearchResponseDb,
} from "./internal/search-helpers";

export type {
  VirtualPairingSearchDogRowDb,
  VirtualPairingSearchFieldDb,
  VirtualPairingSearchRequestDb,
  VirtualPairingSearchResponseDb,
} from "./internal/search-helpers";

function buildBroadWhere(input: {
  field: VirtualPairingSearchFieldDb;
  query: string;
}): Prisma.DogWhereInput {
  const query = normalizeQuery(input.query);
  if (!query) {
    return { id: "__no_match__" };
  }

  if (input.field === "ek") {
    if (hasWildcard(query)) {
      return { ekNo: { not: null } };
    }
    const parsed = Number.parseInt(query, 10);
    if (!Number.isFinite(parsed)) {
      return { id: "__no_match__" };
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
        : { id: "__no_match__" };
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
      : { id: "__no_match__" };
  }

  return {
    name: {
      startsWith: query,
      mode: "insensitive",
    },
  };
}

function matchesField(
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
    : row.name.toLowerCase().startsWith(normalized.toLowerCase());
}

function compareRows(
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

function toRow(row: RawVirtualPairingDogRow): VirtualPairingSearchDogRowDb {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: resolvePrimaryRegistrationNo(row.registrations),
    name: row.name,
    sex: toSexCode(row.sex),
  };
}

export async function searchVirtualPairingDogsDb(
  input: VirtualPairingSearchRequestDb,
): Promise<VirtualPairingSearchResponseDb> {
  const query = normalizeQuery(input.query);
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);

  if (!query) {
    return {
      field: input.field,
      query,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const broadWhere = buildBroadWhere({
    field: input.field,
    query,
  });

  const dogs = (await prisma.dog.findMany({
    where: broadWhere,
    select: {
      id: true,
      ekNo: true,
      name: true,
      sex: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  })) as RawVirtualPairingDogRow[];

  const matched = dogs.filter((row) => matchesField(row, input.field, query));
  matched.sort((left, right) => compareRows(left, right, input.field));

  const total = matched.length;
  const totalPages = Math.ceil(total / pageSize);
  const resolvedPage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
  const start = (resolvedPage - 1) * pageSize;

  return {
    field: input.field,
    query,
    total,
    totalPages,
    page: resolvedPage,
    items: matched.slice(start, start + pageSize).map(toRow),
  };
}
