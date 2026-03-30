import type { Prisma } from "@prisma/client";
import {
  getBusinessDateStartUtc,
  normalizeUtcDateToBusinessDateStart,
  toBusinessYear,
} from "../core/date-only";
import { prisma } from "../core/prisma";
import { collapseJudge } from "./internal/show-judge";
import type {
  BeagleShowSearchRequestDb,
  BeagleShowSearchResponseDb,
  BeagleShowSearchRowDb,
  BeagleShowSearchSortDb,
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
  value: BeagleShowSearchSortDb | undefined,
): BeagleShowSearchSortDb {
  return value === "date-asc" ? "date-asc" : "date-desc";
}

function buildWhere(
  input: BeagleShowSearchRequestDb,
): Prisma.ShowEventWhereInput {
  if (input.mode === "year" && Number.isFinite(input.year)) {
    const year = Math.floor(input.year ?? 0);
    const start = getBusinessDateStartUtc(`${year}-01-01`);
    const end = getBusinessDateStartUtc(`${year + 1}-01-01`);
    if (!start || !end) {
      return {};
    }
    return {
      eventDate: {
        gte: start,
        lt: end,
      },
    };
  }

  if (input.mode === "range" && input.dateFrom && input.dateTo) {
    const start = normalizeUtcDateToBusinessDateStart(input.dateFrom);
    const end = normalizeUtcDateToBusinessDateStart(input.dateTo);
    if (!start || !end) {
      return {};
    }

    return {
      eventDate: {
        gte: start,
        lt: end,
      },
    };
  }

  return {};
}

function compareRows(
  left: BeagleShowSearchRowDb,
  right: BeagleShowSearchRowDb,
  sort: BeagleShowSearchSortDb,
): number {
  const dateComparison =
    sort === "date-asc"
      ? left.eventDate.getTime() - right.eventDate.getTime()
      : right.eventDate.getTime() - left.eventDate.getTime();
  if (dateComparison !== 0) return dateComparison;
  const placeComparison = left.eventPlace.localeCompare(
    right.eventPlace,
    "fi",
    {
      sensitivity: "base",
    },
  );
  if (placeComparison !== 0) return placeComparison;

  return left.eventKey.localeCompare(right.eventKey, "fi", {
    sensitivity: "base",
  });
}

export async function searchBeagleShowsDb(
  input: BeagleShowSearchRequestDb,
): Promise<BeagleShowSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildWhere(input);

  const [yearRows, eventRows] = await Promise.all([
    prisma.showEvent.findMany({
      where: {
        entries: {
          some: {},
        },
      },
      select: {
        eventDate: true,
      },
    }),
    prisma.showEvent.findMany({
      where: {
        ...where,
        entries: {
          some: {},
        },
      },
      select: {
        id: true,
        eventLookupKey: true,
        eventDate: true,
        eventPlace: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
    }),
  ]);

  const availableYears = Array.from(
    new Set(yearRows.map((row) => toBusinessYear(row.eventDate))),
  ).sort((left, right) => right - left);
  const eventIdByKey = new Map(
    eventRows.map((row) => [row.eventLookupKey, row.id] as const),
  );

  const rows: BeagleShowSearchRowDb[] = eventRows
    .map((row) => ({
      eventKey: row.eventLookupKey,
      eventDate: row.eventDate,
      eventPlace: row.eventPlace,
      judge: null,
      dogCount: row._count.entries,
    }))
    .sort((left, right) => compareRows(left, right, sort));

  const total = rows.length;
  const pagination = resolvePagination(total, page, pageSize);
  const pageRows = rows.slice(pagination.start, pagination.start + pageSize);
  const pageEventIds = pageRows
    .map((row) => eventIdByKey.get(row.eventKey))
    .filter((value): value is string => value != null);

  const judgeRows =
    pageEventIds.length === 0
      ? []
      : await prisma.showEntry.findMany({
          where: {
            showEventId: {
              in: pageEventIds,
            },
          },
          select: {
            showEventId: true,
            judge: true,
          },
        });

  const judgesByEventId = new Map<string, string | null>();
  const entriesByEventId = new Map<string, Array<{ judge: string | null }>>();
  for (const row of judgeRows) {
    const existing = entriesByEventId.get(row.showEventId) ?? [];
    existing.push({ judge: row.judge });
    entriesByEventId.set(row.showEventId, existing);
  }
  for (const eventId of pageEventIds) {
    judgesByEventId.set(
      eventId,
      collapseJudge(entriesByEventId.get(eventId) ?? []),
    );
  }

  const pageRowsWithJudges = pageRows.map((row) => {
    const eventId = eventIdByKey.get(row.eventKey);
    return {
      ...row,
      judge: eventId ? (judgesByEventId.get(eventId) ?? null) : null,
    };
  });

  return {
    mode: input.mode,
    year:
      input.mode === "year" && Number.isFinite(input.year)
        ? Math.floor(input.year ?? 0)
        : null,
    dateFrom: input.mode === "range" ? (input.dateFrom ?? null) : null,
    dateTo: input.mode === "range" ? (input.dateTo ?? null) : null,
    availableYears,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items: pageRowsWithJudges,
  };
}
