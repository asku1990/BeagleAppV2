import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type {
  AdminTrialSearchRequestDb,
  AdminTrialSearchResponseDb,
  AdminTrialSummaryDb,
  AdminTrialSearchSortDb,
} from "./types";

const ALLOWED_SORTS: ReadonlySet<AdminTrialSearchSortDb> = new Set([
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
  value: AdminTrialSearchSortDb | undefined,
): AdminTrialSearchSortDb {
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

function buildWhere(query: string): Prisma.TrialEntryWhereInput {
  if (!query) {
    return {};
  }

  const parsedSklKoeId = Number(query);
  const hasSklKoeId = Number.isInteger(parsedSklKoeId) && parsedSklKoeId >= 0;

  return {
    OR: [
      ...(hasSklKoeId
        ? [
            {
              trialEvent: {
                is: { sklKoeId: parsedSklKoeId },
              },
            },
          ]
        : []),
      {
        trialEvent: {
          is: { koekunta: { contains: query, mode: "insensitive" } },
        },
      },
      {
        trialEvent: {
          is: { ylituomariNimi: { contains: query, mode: "insensitive" } },
        },
      },
      {
        trialEvent: {
          is: { jarjestaja: { contains: query, mode: "insensitive" } },
        },
      },
      {
        trialEvent: {
          is: { legacyEventKey: { contains: query, mode: "insensitive" } },
        },
      },
      { yksilointiAvain: { contains: query, mode: "insensitive" } },
      { rekisterinumeroSnapshot: { contains: query, mode: "insensitive" } },
      { koiranNimiSnapshot: { contains: query, mode: "insensitive" } },
      {
        dog: {
          is: {
            name: { contains: query, mode: "insensitive" },
          },
        },
      },
      {
        dog: {
          is: {
            registrations: {
              some: {
                registrationNo: { contains: query, mode: "insensitive" },
              },
            },
          },
        },
      },
    ],
  };
}

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function searchAdminTrialsDb(
  input: AdminTrialSearchRequestDb,
): Promise<AdminTrialSearchResponseDb> {
  const query = normalizeQuery(input.query);
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildWhere(query);
  const orderBy: Prisma.TrialEntryOrderByWithRelationInput[] = [
    { trialEvent: { koepaiva: sort === "date-asc" ? "asc" : "desc" } },
    { trialEvent: { koekunta: "asc" } },
    { yksilointiAvain: "asc" },
  ];

  const total = await prisma.trialEntry.count({ where });
  const pagination = resolvePagination(total, page, pageSize);
  const rows = await prisma.trialEntry.findMany({
    where,
    orderBy,
    skip: pagination.skip,
    take: pageSize,
    select: {
      id: true,
      yksilointiAvain: true,
      rekisterinumeroSnapshot: true,
      koiranNimiSnapshot: true,
      loppupisteet: true,
      palkinto: true,
      sijoitus: true,
      trialEvent: {
        select: {
          sklKoeId: true,
          koepaiva: true,
          koekunta: true,
          ylituomariNimi: true,
        },
      },
      dog: {
        select: {
          name: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  const items: AdminTrialSummaryDb[] = rows.map((row) => ({
    trialId: row.id,
    dogName:
      row.dog?.name?.trim() ||
      row.koiranNimiSnapshot?.trim() ||
      row.rekisterinumeroSnapshot,
    registrationNo:
      row.rekisterinumeroSnapshot ||
      row.dog?.registrations[0]?.registrationNo ||
      null,
    sklKoeId: row.trialEvent.sklKoeId ?? null,
    entryKey: row.yksilointiAvain,
    eventDate: row.trialEvent.koepaiva,
    eventPlace: row.trialEvent.koekunta,
    ylituomariNimi: row.trialEvent.ylituomariNimi,
    loppupisteet: toNumberOrNull(row.loppupisteet),
    palkinto: row.palkinto,
    sijoitus: row.sijoitus,
  }));

  return {
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}
