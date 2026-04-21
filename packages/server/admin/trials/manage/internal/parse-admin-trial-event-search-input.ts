import type {
  AdminTrialEventSearchRequest,
  AdminTrialEventSearchSort,
} from "@beagle/contracts";
import type { AdminTrialEventSearchSortDb } from "@beagle/db";
import { getTrialBusinessDateUtcRange } from "../../../../trials/core/business-date";

export type ParsedAdminTrialEventSearchInput = {
  query: string;
  page: number;
  pageSize: number;
  sort: AdminTrialEventSearchSortDb;
  mode: "year" | "range" | null;
  year: number | null;
  dateFromIso: string | null;
  dateToIso: string | null;
  rangeFromDate: Date | null;
  rangeToExclusive: Date | null;
};

type ParseAdminTrialEventSearchInputError = {
  status: 400;
  body: {
    ok: false;
    error: string;
    code: string;
  };
};

type ParseAdminTrialEventSearchInputResult =
  | { ok: true; value: ParsedAdminTrialEventSearchInput }
  | { ok: false; error: ParseAdminTrialEventSearchInputError };

const ALLOWED_SORTS: ReadonlySet<AdminTrialEventSearchSort> = new Set([
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

  if (ALLOWED_SORTS.has(value as AdminTrialEventSearchSort)) {
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
  if (value == null || !Number.isFinite(value) || !Number.isInteger(value)) {
    return null;
  }
  if (value < 1900 || value > 2100) return null;
  return value;
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

export function parseAdminTrialEventSearchInput(
  input: AdminTrialEventSearchRequest,
): ParseAdminTrialEventSearchInputResult {
  const parsedSort = parseSort(input.sort);
  if (!parsedSort.ok) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "Invalid sort value.",
          code: "INVALID_SORT",
        },
      },
    };
  }

  const year = parseYear(input.year);
  const hasYearInput = input.year != null;
  if (hasYearInput && year == null) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "Invalid year value.",
          code: "INVALID_YEAR",
        },
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
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "Invalid date range value.",
          code: "INVALID_DATE_RANGE",
        },
      },
    };
  }

  if (year != null && hasRangeInput) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "Use either year or date range filter.",
          code: "MIXED_FILTERS",
        },
      },
    };
  }

  if (hasRangeInput && (!dateFromIso || !dateToIso)) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "Both dateFrom and dateTo are required.",
          code: "INCOMPLETE_RANGE",
        },
      },
    };
  }

  if (dateFromIso && dateToIso && dateFromIso > dateToIso) {
    return {
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "dateFrom must be before or equal to dateTo.",
          code: "INVALID_RANGE_ORDER",
        },
      },
    };
  }

  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const query = normalizeQuery(input.query);
  const mode = year != null ? "year" : hasRangeInput ? "range" : null;
  const rangeFromDate = dateFromIso
    ? getTrialBusinessDateUtcRange(new Date(`${dateFromIso}T00:00:00.000Z`))
        .start
    : null;
  const rangeToExclusive = dateToIso
    ? getTrialBusinessDateUtcRange(new Date(`${dateToIso}T00:00:00.000Z`))
        .endExclusive
    : null;

  return {
    ok: true,
    value: {
      query,
      page,
      pageSize,
      sort: parsedSort.value,
      mode,
      year,
      dateFromIso,
      dateToIso,
      rangeFromDate,
      rangeToExclusive,
    },
  };
}
