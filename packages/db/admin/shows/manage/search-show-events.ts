import type { Prisma } from "@prisma/client";
import { prisma } from "../../../core/prisma";
import { collapseJudge } from "../../../shows/internal/show-judge";
import type {
  AdminShowSearchRequestDb,
  AdminShowSearchResponseDb,
  AdminShowSearchRowDb,
  AdminShowSearchSortDb,
} from "./types";

const ALLOWED_SORTS: ReadonlySet<AdminShowSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.min(100, Math.max(1, Math.floor(value ?? 20)));
}

function normalizeSort(
  value: AdminShowSearchSortDb | undefined,
): AdminShowSearchSortDb {
  if (!value || !ALLOWED_SORTS.has(value)) {
    return "date-desc";
  }
  return value;
}

function resolvePagination(
  total: number,
  page: number,
  pageSize: number,
): {
  totalPages: number;
  page: number;
  skip: number;
} {
  if (total === 0) {
    return { totalPages: 0, page: 1, skip: 0 };
  }

  const totalPages = Math.ceil(total / pageSize);
  const normalizedPage = Math.min(Math.max(1, page), totalPages);

  return {
    totalPages,
    page: normalizedPage,
    skip: (normalizedPage - 1) * pageSize,
  };
}

function buildQueryWhere(
  query: string | undefined,
): Prisma.ShowEventWhereInput {
  const normalizedQuery = query?.trim() ?? "";
  const baseWhere: Prisma.ShowEventWhereInput = {};

  if (!normalizedQuery) {
    return baseWhere;
  }

  return {
    ...baseWhere,
    OR: [
      { eventPlace: { contains: normalizedQuery, mode: "insensitive" } },
      { eventCity: { contains: normalizedQuery, mode: "insensitive" } },
      { eventName: { contains: normalizedQuery, mode: "insensitive" } },
      { eventType: { contains: normalizedQuery, mode: "insensitive" } },
      { organizer: { contains: normalizedQuery, mode: "insensitive" } },
      {
        entries: {
          some: {
            OR: [
              {
                registrationNoSnapshot: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
              {
                dogNameSnapshot: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
              { judge: { contains: normalizedQuery, mode: "insensitive" } },
              {
                critiqueText: {
                  contains: normalizedQuery,
                  mode: "insensitive",
                },
              },
              {
                heightText: { contains: normalizedQuery, mode: "insensitive" },
              },
              { sourceRef: { contains: normalizedQuery, mode: "insensitive" } },
              {
                legacyFlag: { contains: normalizedQuery, mode: "insensitive" },
              },
            ],
          },
        },
      },
    ],
  };
}

export async function searchAdminShowEventsDb(
  input: AdminShowSearchRequestDb,
): Promise<AdminShowSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildQueryWhere(input.query);
  const orderBy: Prisma.ShowEventOrderByWithRelationInput[] = [
    { eventDate: sort === "date-asc" ? "asc" : "desc" },
    { eventPlace: "asc" },
    { eventLookupKey: "asc" },
  ];

  const total = await prisma.showEvent.count({ where });
  const pagination = resolvePagination(total, page, pageSize);
  const rows = await prisma.showEvent.findMany({
    where,
    orderBy,
    skip: pagination.skip,
    take: pageSize,
    select: {
      eventLookupKey: true,
      eventDate: true,
      eventPlace: true,
      eventCity: true,
      eventName: true,
      eventType: true,
      organizer: true,
      entries: {
        select: {
          judge: true,
        },
      },
    },
  });

  const items: AdminShowSearchRowDb[] = rows.map((row) => ({
    eventKey: row.eventLookupKey,
    eventDate: row.eventDate,
    eventPlace: row.eventPlace,
    eventCity: row.eventCity,
    eventName: row.eventName,
    eventType: row.eventType,
    organizer: row.organizer,
    judge: collapseJudge(row.entries),
    dogCount: row.entries.length,
  }));

  return {
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}
