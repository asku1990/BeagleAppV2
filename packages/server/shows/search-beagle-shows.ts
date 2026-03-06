import { searchBeagleShowsDb, type BeagleShowSearchSortDb } from "@beagle/db";
import type {
  BeagleShowSearchRequest,
  BeagleShowSearchResponse,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "../core/date-only";
import { toErrorLog, withLogContext } from "../core/logger";
import type { ServiceResult } from "../core/result";
import { parseIsoDateOnly } from "./internal/iso-date";
import { encodeShowId } from "./internal/show-id";
import type { ShowsServiceLogContext } from "./types";

const ALLOWED_SORTS: ReadonlySet<BeagleShowSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function parseSort(
  value: string | undefined,
): { ok: true; value: BeagleShowSearchSortDb } | { ok: false } {
  if (!value) return { ok: true, value: "date-desc" };
  if (ALLOWED_SORTS.has(value as BeagleShowSearchSortDb)) {
    return { ok: true, value: value as BeagleShowSearchSortDb };
  }
  return { ok: false };
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value ?? 10)));
}

function parseYear(value: number | undefined): number | null {
  if (!Number.isFinite(value)) return null;
  const year = Math.floor(value ?? 0);
  if (year < 1900 || year > 2100) return null;
  return year;
}

function toUtcDateStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function addUtcDays(value: Date, days: number): Date {
  const next = new Date(value.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function searchBeagleShowsService(
  input: BeagleShowSearchRequest,
  context?: ShowsServiceLogContext,
): Promise<ServiceResult<BeagleShowSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "shows.searchBeagleShows",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const sortResult = parseSort(input.sort);
  if (!sortResult.ok) {
    log.warn(
      {
        event: "invalid_sort",
        sort: input.sort,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because sort is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid sort value." },
    };
  }

  const year = parseYear(input.year);
  const hasYearInput = input.year != null;
  if (hasYearInput && year == null) {
    log.warn(
      {
        event: "invalid_year",
        year: input.year,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because year is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid year value." },
    };
  }

  const dateFromIso = parseIsoDateOnly(input.dateFrom);
  const dateToIso = parseIsoDateOnly(input.dateTo);
  const hasDateFromInput = Boolean(input.dateFrom?.trim());
  const hasDateToInput = Boolean(input.dateTo?.trim());
  const hasRangeInput = hasDateFromInput || hasDateToInput;

  if ((hasDateFromInput && !dateFromIso) || (hasDateToInput && !dateToIso)) {
    log.warn(
      {
        event: "invalid_date_range",
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because date range is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid date range value." },
    };
  }

  if (year != null && hasRangeInput) {
    log.warn(
      {
        event: "mixed_filters",
        year,
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because year and range filters are mixed",
    );
    return {
      status: 400,
      body: { ok: false, error: "Use either year or date range filter." },
    };
  }

  if (hasRangeInput && (!dateFromIso || !dateToIso)) {
    log.warn(
      {
        event: "incomplete_range",
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because date range is incomplete",
    );
    return {
      status: 400,
      body: { ok: false, error: "Both dateFrom and dateTo are required." },
    };
  }

  if (dateFromIso && dateToIso && dateFromIso > dateToIso) {
    log.warn(
      {
        event: "invalid_range_order",
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
      },
      "shows search rejected because dateFrom is after dateTo",
    );
    return {
      status: 400,
      body: { ok: false, error: "dateFrom must be before or equal to dateTo." },
    };
  }

  const normalizedPage = parsePage(input.page);
  const normalizedPageSize = parsePageSize(input.pageSize);

  log.info(
    {
      event: "start",
      year,
      dateFrom: dateFromIso,
      dateTo: dateToIso,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      sort: sortResult.value,
    },
    "shows search started",
  );

  try {
    const rangeFromDate = dateFromIso ? toUtcDateStart(dateFromIso) : null;
    const rangeToExclusive = dateToIso
      ? addUtcDays(toUtcDateStart(dateToIso), 1)
      : null;

    const resolvedMode = year != null ? "year" : hasRangeInput ? "range" : null;

    const result =
      resolvedMode === "year"
        ? await searchBeagleShowsDb({
            mode: "year",
            year: year ?? undefined,
            page: normalizedPage,
            pageSize: normalizedPageSize,
            sort: sortResult.value,
          })
        : resolvedMode === "range"
          ? await searchBeagleShowsDb({
              mode: "range",
              dateFrom: rangeFromDate ?? undefined,
              dateTo: rangeToExclusive ?? undefined,
              page: normalizedPage,
              pageSize: normalizedPageSize,
              sort: sortResult.value,
            })
          : await (async () => {
              const available = await searchBeagleShowsDb({
                mode: "range",
                page: 1,
                pageSize: 1,
                sort: sortResult.value,
              });
              const latestYear = available.availableYears[0];
              if (!latestYear) {
                return {
                  ...available,
                  mode: "year" as const,
                  year: null,
                };
              }
              return searchBeagleShowsDb({
                mode: "year",
                year: latestYear,
                page: normalizedPage,
                pageSize: normalizedPageSize,
                sort: sortResult.value,
              });
            })();

    const filterMode = resolvedMode ?? result.mode;
    const filterYear =
      resolvedMode === "year"
        ? year
        : resolvedMode == null
          ? result.year
          : null;
    const filterDateFrom = resolvedMode === "range" ? dateFromIso : null;
    const filterDateTo = resolvedMode === "range" ? dateToIso : null;

    const data: BeagleShowSearchResponse = {
      filters: {
        mode: filterMode,
        year: filterYear ?? null,
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
      },
      availableYears: result.availableYears,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      items: result.items.map((item) => {
        const eventDate = toBusinessDateOnly(item.eventDate);
        return {
          showId: encodeShowId(eventDate, item.eventPlace),
          eventDate,
          eventPlace: item.eventPlace,
          judge: item.judge,
          dogCount: item.dogCount,
        };
      }),
    };

    log.info(
      {
        event: "success",
        mode: data.filters.mode,
        total: data.total,
        itemCount: data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "shows search succeeded",
    );

    return { status: 200, body: { ok: true, data } };
  } catch (error) {
    log.error(
      {
        event: "exception",
        year,
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "shows search failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load beagle shows." },
    };
  }
}
