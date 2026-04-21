import {
  searchAdminTrialsDb,
  type AdminTrialEventSearchSortDb,
} from "@beagle/db";
import type {
  AdminTrialEventSearchFilters,
  AdminTrialEventSearchRequest,
  AdminTrialEventSearchResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const ALLOWED_SORTS: ReadonlySet<AdminTrialEventSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

function parseSort(
  value: string | undefined,
): { ok: true; value: AdminTrialEventSearchSortDb } | { ok: false } {
  if (!value) {
    return { ok: true, value: "date-desc" };
  }

  if (ALLOWED_SORTS.has(value as AdminTrialEventSearchSortDb)) {
    return { ok: true, value: value as AdminTrialEventSearchSortDb };
  }

  return { ok: false };
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.min(100, Math.max(1, Math.floor(value ?? 20)));
}

function parseYear(value: number | undefined): number | null {
  if (!Number.isFinite(value)) return null;
  if (!Number.isInteger(value)) return null;
  const year = value;
  if (year < 1900 || year > 2100) return null;
  return year;
}

function parseIsoDateOnly(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const roundTripped = [
    parsed.getUTCFullYear(),
    String(parsed.getUTCMonth() + 1).padStart(2, "0"),
    String(parsed.getUTCDate()).padStart(2, "0"),
  ].join("-");

  if (roundTripped !== normalized) {
    return null;
  }

  return normalized;
}

function toUtcDateStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function addUtcDays(value: Date, days: number): Date {
  const next = new Date(value.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function listAdminTrialEvents(
  input: AdminTrialEventSearchRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminTrialEventSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.listAdminTrialEvents",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trial events list rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const parsedSort = parseSort(input.sort);
  if (!parsedSort.ok) {
    log.warn(
      {
        event: "invalid_sort",
        sort: input.sort,
        durationMs: Date.now() - startedAt,
      },
      "admin trial events list rejected because sort is invalid",
    );

    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid sort value.",
        code: "INVALID_SORT",
      },
    };
  }

  const year = parseYear(input.year);
  const hasYearInput = input.year != null;
  if (hasYearInput && year == null) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid year value.",
        code: "INVALID_YEAR",
      },
    };
  }

  const dateFromIso = parseIsoDateOnly(input.dateFrom);
  const dateToIso = parseIsoDateOnly(input.dateTo);
  const hasDateFromInput = Boolean(input.dateFrom?.trim());
  const hasDateToInput = Boolean(input.dateTo?.trim());
  const hasRangeInput = hasDateFromInput || hasDateToInput;

  if ((hasDateFromInput && !dateFromIso) || (hasDateToInput && !dateToIso)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid date range value.",
        code: "INVALID_DATE_RANGE",
      },
    };
  }

  if (year != null && hasRangeInput) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Use either year or date range filter.",
        code: "MIXED_FILTERS",
      },
    };
  }

  if (hasRangeInput && (!dateFromIso || !dateToIso)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Both dateFrom and dateTo are required.",
        code: "INCOMPLETE_RANGE",
      },
    };
  }

  if (dateFromIso && dateToIso && dateFromIso > dateToIso) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "dateFrom must be before or equal to dateTo.",
        code: "INVALID_RANGE_ORDER",
      },
    };
  }

  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const query = normalizeQuery(input.query);
  const resolvedMode = year != null ? "year" : hasRangeInput ? "range" : null;
  const rangeFromDate = dateFromIso ? toUtcDateStart(dateFromIso) : null;
  const rangeToExclusive = dateToIso
    ? addUtcDays(toUtcDateStart(dateToIso), 1)
    : null;

  log.info(
    {
      event: "start",
      query,
      page,
      pageSize,
      sort: parsedSort.value,
      year,
      dateFrom: dateFromIso,
      dateTo: dateToIso,
    },
    "admin trial events list started",
  );

  try {
    const result =
      resolvedMode === "year"
        ? await searchAdminTrialsDb({
            mode: "year",
            query,
            year: year ?? undefined,
            page,
            pageSize,
            sort: parsedSort.value,
          })
        : resolvedMode === "range"
          ? await searchAdminTrialsDb({
              mode: "range",
              query,
              dateFrom: rangeFromDate ?? undefined,
              dateTo: rangeToExclusive ?? undefined,
              page,
              pageSize,
              sort: parsedSort.value,
            })
          : await (async () => {
              const available = await searchAdminTrialsDb({
                mode: "range",
                query,
                page: 1,
                pageSize: 1,
                sort: parsedSort.value,
              });
              const latestYear = available.availableYears[0];
              if (!latestYear) {
                return {
                  ...available,
                  mode: "year" as const,
                  year: null,
                };
              }
              return searchAdminTrialsDb({
                mode: "year",
                query,
                year: latestYear,
                page,
                pageSize,
                sort: parsedSort.value,
              });
            })();

    const filters: AdminTrialEventSearchFilters = {
      mode: resolvedMode ?? (result.mode === "range" ? "range" : "year"),
      year:
        resolvedMode === "year"
          ? year
          : resolvedMode == null
            ? result.year
            : null,
      dateFrom: resolvedMode === "range" ? dateFromIso : null,
      dateTo: resolvedMode === "range" ? dateToIso : null,
    };

    const data: AdminTrialEventSearchResponse = {
      filters,
      availableYears: result.availableYears,
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      items: result.items.map((item) => ({
        trialEventId: item.trialEventId,
        eventDate: toBusinessDateOnly(item.eventDate),
        eventPlace: item.eventPlace,
        eventName: item.eventName,
        organizer: item.organizer,
        judge: item.judge,
        sklKoeId: item.sklKoeId,
        dogCount: item.dogCount,
      })),
    };

    log.info(
      {
        event: "success",
        mode: data.filters.mode,
        total: data.total,
        itemCount: data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin trial events list succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data,
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial events list failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial events.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
