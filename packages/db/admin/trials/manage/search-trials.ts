import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type {
  AdminTrialEventSearchRequestDb,
  AdminTrialEventSearchResponseDb,
  AdminTrialEventSearchSortDb,
  AdminTrialEventSummaryDb,
} from "./types";

const ALLOWED_SORTS: ReadonlySet<AdminTrialEventSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.min(100, Math.max(1, Math.floor(value ?? 20)));
}

function normalizeSort(
  value: AdminTrialEventSearchSortDb | undefined,
): AdminTrialEventSearchSortDb {
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
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  return {
    totalPages,
    page: clampedPage,
    skip: (clampedPage - 1) * pageSize,
  };
}

function buildDateWhere(
  input: AdminTrialEventSearchRequestDb,
): Prisma.TrialEventWhereInput {
  if (input.dateFrom && input.dateTo) {
    return {
      koepaiva: {
        gte: input.dateFrom,
        lt: input.dateTo,
      },
    };
  }

  return {};
}

function buildTextWhere(query: string): Prisma.TrialEventWhereInput {
  if (!query) {
    return {};
  }

  const parsedSklKoeId = Number(query);
  const hasSklKoeId = Number.isInteger(parsedSklKoeId) && parsedSklKoeId >= 0;

  return {
    OR: [
      ...(hasSklKoeId ? [{ sklKoeId: parsedSklKoeId }] : []),
      { koekunta: { contains: query, mode: "insensitive" } },
      { jarjestaja: { contains: query, mode: "insensitive" } },
      { ylituomariNimi: { contains: query, mode: "insensitive" } },
      { legacyEventKey: { contains: query, mode: "insensitive" } },
      { koemuoto: { contains: query, mode: "insensitive" } },
      { rotukoodi: { contains: query, mode: "insensitive" } },
      { kennelpiiri: { contains: query, mode: "insensitive" } },
      { kennelpiirinro: { contains: query, mode: "insensitive" } },
    ],
  };
}

function buildWhere(
  input: AdminTrialEventSearchRequestDb,
): Prisma.TrialEventWhereInput {
  const query = normalizeQuery(input.query);
  const dateWhere = buildDateWhere(input);
  const textWhere = buildTextWhere(query);
  return {
    AND: [dateWhere, textWhere],
  };
}

export async function searchAdminTrialsDb(
  input: AdminTrialEventSearchRequestDb,
): Promise<AdminTrialEventSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildWhere(input);
  const orderBy: Prisma.TrialEventOrderByWithRelationInput[] = [
    { koepaiva: sort === "date-asc" ? "asc" : "desc" },
    { koekunta: "asc" },
    { id: "asc" },
  ];

  const [years, total] = await Promise.all([
    prisma.trialEvent.findMany({
      select: { koepaiva: true },
      orderBy: [{ koepaiva: "desc" }],
    }),
    prisma.trialEvent.count({ where }),
  ]);

  const availableEventDates = years.map((row) => row.koepaiva);
  const pagination = resolvePagination(total, page, pageSize);

  const rows = await prisma.trialEvent.findMany({
    where,
    orderBy,
    skip: pagination.skip,
    take: pageSize,
    select: {
      id: true,
      sklKoeId: true,
      koepaiva: true,
      koekunta: true,
      jarjestaja: true,
      koemuoto: true,
      ylituomariNimi: true,
      _count: {
        select: {
          entries: true,
        },
      },
    },
  });

  const items: AdminTrialEventSummaryDb[] = rows.map((row) => ({
    trialEventId: row.id,
    eventDate: row.koepaiva,
    eventPlace: row.koekunta,
    eventName: row.jarjestaja,
    organizer: row.jarjestaja,
    judge: row.ylituomariNimi,
    sklKoeId: row.sklKoeId ?? null,
    dogCount: row._count.entries,
  }));

  return {
    availableEventDates,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}
