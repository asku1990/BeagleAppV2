// Reads the public beagle trial list from canonical TrialEvent rows.
// Events are grouped in memory by (koepaiva, koekunta) to produce one public
// row per date/place — mirrors legacy TrialResult groupBy behavior and
// preserves the existing public URL scheme.
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

// Serialises a Date to a Helsinki business-date string (YYYY-MM-DD).
// Mirrors toBusinessDateOnly in packages/server/core/date-only.ts so that the
// grouping key here is always consistent with the public trialId encoding done
// in the service layer. packages/db cannot import from packages/server (circular
// dependency), so the logic is kept in sync manually.
const HELSINKI_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Helsinki",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function toHelsinkiDateKey(date: Date): string {
  const parts = HELSINKI_DATE_FORMATTER.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

// Returns the shared judge name when all non-empty values agree, otherwise null.
function resolveJudge(names: (string | null | undefined)[]): string | null {
  const nonEmpty = names
    .map((n) => n?.trim())
    .filter((n): n is string => Boolean(n));
  if (nonEmpty.length === 0) return null;
  const unique = new Set(nonEmpty);
  return unique.size === 1 ? [...unique][0]! : null;
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
        koepaiva: true,
        koekunta: true,
        ylituomariNimi: true,
        _count: { select: { entries: true } },
      },
    }),
  ]);

  const availableEventDates = availableDateRows.map((row) => row.koepaiva);

  // Group canonical events by (koepaiva, koekunta) into one public row each.
  // Sums entry counts and resolves a shared judge when all non-empty
  // ylituomariNimi values agree across matched TrialEvent rows.
  type GroupAccum = {
    eventDate: Date;
    eventPlace: string;
    dogCount: number;
    judgeNames: (string | null | undefined)[];
  };

  const groupMap = new Map<string, GroupAccum>();
  for (const row of eventRows) {
    // Use the Helsinki business date so events that share the same Finnish
    // calendar day but differ in UTC time (e.g. koepaiva stored at local
    // midnight vs. UTC midnight) still produce one public row — matching the
    // behaviour of the detail endpoint which uses a full-day UTC range.
    const key = `${toHelsinkiDateKey(row.koepaiva)}::${row.koekunta}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.dogCount += row._count.entries;
      existing.judgeNames.push(row.ylituomariNimi);
    } else {
      groupMap.set(key, {
        eventDate: row.koepaiva,
        eventPlace: row.koekunta,
        dogCount: row._count.entries,
        judgeNames: [row.ylituomariNimi],
      });
    }
  }

  const rows: BeagleTrialSearchRowDb[] = Array.from(groupMap.values())
    .map((group) => ({
      eventDate: group.eventDate,
      eventPlace: group.eventPlace,
      judge: resolveJudge(group.judgeNames),
      dogCount: group.dogCount,
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
