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
  const placeComparison = left.eventPlace.localeCompare(
    right.eventPlace,
    "fi",
    {
      sensitivity: "base",
    },
  );
  if (placeComparison !== 0) return placeComparison;
  return left.trialEventId.localeCompare(right.trialEventId, "fi", {
    sensitivity: "base",
  });
}

export async function searchBeagleTrialsDb(
  input: BeagleTrialSearchRequestDb,
): Promise<BeagleTrialSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);

  const dateWhere =
    input.dateFrom && input.dateTo
      ? { koepaiva: { gte: input.dateFrom, lt: input.dateTo } }
      : {};

  const [availableDateRows, eventRows] = await Promise.all([
    // Distinct koepaiva values used for the year-filter picker.
    // Same entries filter applied as the main query so empty-event years
    // never appear as selectable options or as the default year.
    prisma.trialEvent.findMany({
      where: { entries: { some: {} } },
      select: { koepaiva: true },
      orderBy: { koepaiva: "desc" },
      distinct: ["koepaiva"],
    }),
    // All events in the requested date window that have at least one entry.
    // Filtering here prevents zero-entry events from appearing in the public
    // list (which would 404 on detail, since detail returns null for empty events).
    prisma.trialEvent.findMany({
      where: { ...dateWhere, entries: { some: {} } },
      select: {
        id: true,
        koepaiva: true,
        koekunta: true,
        ylituomariNimi: true,
        _count: { select: { entries: true } },
      },
    }),
  ]);

  const availableEventDates = availableDateRows.map((row) => row.koepaiva);
  const rows: BeagleTrialSearchRowDb[] = eventRows
    .map((row) => ({
      trialEventId: row.id,
      eventDate: row.koepaiva,
      eventPlace: row.koekunta,
      judge: row.ylituomariNimi?.trim() || null,
      dogCount: row._count.entries,
    }))
    .sort((left, right) => compareRows(left, right, sort));

  const total = rows.length;
  const pagination = resolvePagination(total, page, pageSize);
  const items = rows.slice(pagination.start, pagination.start + pageSize);

  return {
    availableEventDates,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}
