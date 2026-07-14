import { prisma } from "@db/core/prisma";
import { DogStatus } from "@prisma/client";
import {
  VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT,
  normalizeQuery,
  parsePage,
  parsePageSize,
  resolvePrimaryRegistrationNo,
  toSexCode,
  type RawVirtualPairingDogRow,
  type VirtualPairingSearchDogRowDb,
  type VirtualPairingSearchRequestDb,
  type VirtualPairingSearchResponseDb,
} from "./internal/search-helpers";
import {
  buildBoundedWhere,
  buildBroadWhere,
  compareRows,
  loadVirtualPairingDogs,
  matchesField,
  resolveBoundedOrderBy,
  resolveBroadOrderBy,
} from "./internal/search-execution";

export type {
  VirtualPairingSearchDogRowDb,
  VirtualPairingSearchRequestDb,
  VirtualPairingSearchResponseDb,
} from "./internal/search-helpers";

function toRow(row: RawVirtualPairingDogRow): VirtualPairingSearchDogRowDb {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: resolvePrimaryRegistrationNo(row.registrations),
    name: row.name,
    sex: toSexCode(row.sex),
    trialCount: row._count.trialEntries,
    showCount: row._count.showEntries,
  };
}

export async function searchVirtualPairingDogsDb(
  input: VirtualPairingSearchRequestDb,
  allowedStatuses: readonly DogStatus[] = [
    DogStatus.NORMAL,
    DogStatus.REFERENCE_ONLY,
  ],
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
      isLimited: false,
      candidateLimit: null,
      items: [],
    };
  }

  const boundedWhere = buildBoundedWhere({
    field: input.field,
    query,
  });
  if (boundedWhere) {
    const where = {
      AND: [{ status: { in: [...allowedStatuses] } }, boundedWhere],
    };
    const total = await prisma.dog.count({ where });
    const totalPages = Math.ceil(total / pageSize);
    const resolvedPage =
      totalPages === 0 ? 1 : Math.min(Math.max(1, page), totalPages);
    const start = (resolvedPage - 1) * pageSize;

    const rows = await loadVirtualPairingDogs({
      where,
      orderBy: resolveBoundedOrderBy(input.field),
      skip: start,
      take: pageSize,
      select: {
        id: true,
        ekNo: true,
        name: true,
        sex: true,
        _count: {
          select: {
            trialEntries: true,
            showEntries: true,
          },
        },
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      field: input.field,
      query,
      total,
      totalPages,
      page: resolvedPage,
      isLimited: false,
      candidateLimit: null,
      items: rows.map(toRow),
    };
  }

  const broadWhere = buildBroadWhere({
    field: input.field,
    query,
  });
  if (!broadWhere) {
    return {
      field: input.field,
      query,
      total: 0,
      totalPages: 0,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [],
    };
  }

  const rows = await loadVirtualPairingDogs({
    where: {
      AND: [{ status: { in: [...allowedStatuses] } }, broadWhere],
    },
    orderBy: resolveBroadOrderBy(input.field),
    take: VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT + 1,
    select: {
      id: true,
      ekNo: true,
      name: true,
      sex: true,
      _count: {
        select: {
          trialEntries: true,
          showEntries: true,
        },
      },
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  });

  const isLimited = rows.length > VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT;
  const cappedRows = isLimited
    ? rows.slice(0, VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT)
    : rows;
  const matched = cappedRows.filter((row) =>
    matchesField(row, input.field, query),
  );
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
    isLimited,
    candidateLimit: VIRTUAL_PAIRING_BROAD_CANDIDATE_LIMIT,
    items: matched.slice(start, start + pageSize).map(toRow),
  };
}
