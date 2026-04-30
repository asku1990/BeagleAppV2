import type { Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type {
  BeagleTrialSearchRequestDb,
  BeagleTrialSearchResponseDb,
  BeagleTrialSearchRowDb,
  BeagleTrialSearchSortDb,
} from "./types";

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value ?? 10)));
}

function resolvePagination(
  total: number,
  page: number,
  pageSize: number,
): {
  totalPages: number;
  page: number;
  start: number;
} {
  if (total === 0) {
    return { totalPages: 0, page: 1, start: 0 };
  }

  const totalPages = Math.ceil(total / pageSize);
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  return {
    totalPages,
    page: clampedPage,
    start: (clampedPage - 1) * pageSize,
  };
}

function normalizeSort(
  value: BeagleTrialSearchSortDb | undefined,
): BeagleTrialSearchSortDb {
  return value === "date-asc" ? "date-asc" : "date-desc";
}

function buildWhere(
  input: BeagleTrialSearchRequestDb,
): Prisma.TrialResultWhereInput {
  if (input.dateFrom && input.dateTo) {
    return {
      eventDate: {
        gte: input.dateFrom,
        lt: input.dateTo,
      },
    };
  }

  return {};
}

function compareRows(
  left: BeagleTrialSearchRowDb,
  right: BeagleTrialSearchRowDb,
  sort: BeagleTrialSearchSortDb,
): number {
  const dateComparison =
    sort === "date-asc"
      ? left.eventDate.getTime() - right.eventDate.getTime()
      : right.eventDate.getTime() - left.eventDate.getTime();
  if (dateComparison !== 0) return dateComparison;
  return left.eventPlace.localeCompare(right.eventPlace, "fi", {
    sensitivity: "base",
  });
}

export async function searchBeagleTrialsDb(
  input: BeagleTrialSearchRequestDb,
): Promise<BeagleTrialSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildWhere(input);

  const [availableDateRows, groupedRows] = await Promise.all([
    prisma.trialResult.groupBy({
      by: ["eventDate"],
    }),
    prisma.trialResult.groupBy({
      by: ["eventDate", "eventPlace"],
      where,
      _count: { _all: true },
      _max: { judge: true },
    }),
  ]);

  const availableEventDates = availableDateRows
    .map((row) => row.eventDate)
    .sort((left, right) => right.getTime() - left.getTime());

  const rows: BeagleTrialSearchRowDb[] = groupedRows
    .map((row) => ({
      eventDate: row.eventDate,
      eventPlace: row.eventPlace,
      judge: row._max.judge ?? null,
      dogCount: row._count._all,
    }))
    .sort((left, right) => compareRows(left, right, sort));

  const total = rows.length;
  const pagination = resolvePagination(total, page, pageSize);
  const pageRows = rows.slice(pagination.start, pagination.start + pageSize);

  const judgeRows =
    pageRows.length === 0
      ? []
      : await prisma.trialResult.findMany({
          where: {
            OR: pageRows.map((row) => ({
              eventDate: row.eventDate,
              eventPlace: row.eventPlace,
            })),
          },
          select: {
            eventDate: true,
            eventPlace: true,
            judge: true,
          },
        });

  const judgeByEvent = new Map<string, string | null>();
  for (const row of judgeRows) {
    const key = `${row.eventDate.toISOString()}::${row.eventPlace}`;
    const normalizedJudge = row.judge?.trim() ?? "";
    if (!normalizedJudge) {
      continue;
    }
    const existing = judgeByEvent.get(key);
    if (existing == null) {
      judgeByEvent.set(key, normalizedJudge);
      continue;
    }
    if (existing !== normalizedJudge) {
      judgeByEvent.set(key, null);
    }
  }

  const items = pageRows.map((row) => {
    const key = `${row.eventDate.toISOString()}::${row.eventPlace}`;
    const judge = judgeByEvent.get(key);
    return {
      ...row,
      judge: judge === undefined ? null : judge,
    };
  });

  return {
    availableEventDates,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}
