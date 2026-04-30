import { searchAdminTrialsDb } from "@beagle/db";
import {
  getTrialBusinessYearUtcRange,
  toTrialBusinessYear,
} from "@server/trials/core/business-date";
import type { ParsedAdminTrialEventSearchInput } from "./parse-admin-trial-event-search-input";

export type ResolvedAdminTrialEventSearch = {
  mode: "year" | "range";
  year: number | null;
  dateFromIso: string | null;
  dateToIso: string | null;
  result: Awaited<ReturnType<typeof searchAdminTrialsDb>>;
};

function collectAvailableYears(availableEventDates: Date[]): number[] {
  return Array.from(
    new Set(availableEventDates.map((value) => toTrialBusinessYear(value))),
  ).sort((left, right) => right - left);
}

export async function resolveAdminTrialEventSearchResponseDb(
  input: ParsedAdminTrialEventSearchInput,
): Promise<ResolvedAdminTrialEventSearch> {
  const hasQuery = input.query.length > 0;

  if (input.mode === "year") {
    const yearRange = getTrialBusinessYearUtcRange(input.year ?? 0);
    if (!yearRange) {
      throw new Error("Failed to build admin trial year range.");
    }

    return searchAdminTrialsDb({
      query: input.query,
      dateFrom: yearRange.start,
      dateTo: yearRange.endExclusive,
      page: input.page,
      pageSize: input.pageSize,
      sort: input.sort,
    }).then((result) => ({
      mode: "year" as const,
      year: input.year,
      dateFromIso: null,
      dateToIso: null,
      result,
    }));
  }

  if (input.mode === "range") {
    const result = await searchAdminTrialsDb({
      query: input.query,
      dateFrom: input.rangeFromDate ?? undefined,
      dateTo: input.rangeToExclusive ?? undefined,
      page: input.page,
      pageSize: input.pageSize,
      sort: input.sort,
    });
    return {
      mode: "range",
      year: null,
      dateFromIso: input.dateFromIso,
      dateToIso: input.dateToIso,
      result,
    };
  }

  if (hasQuery) {
    const result = await searchAdminTrialsDb({
      query: input.query,
      page: input.page,
      pageSize: input.pageSize,
      sort: input.sort,
    });
    return {
      mode: "year",
      year: null,
      dateFromIso: null,
      dateToIso: null,
      result,
    };
  }

  const available = await searchAdminTrialsDb({
    query: input.query,
    page: 1,
    pageSize: 1,
    sort: input.sort,
  });
  const availableYears = collectAvailableYears(available.availableEventDates);
  const latestYear = availableYears[0];
  if (!latestYear) {
    return {
      mode: "year",
      year: null,
      dateFromIso: null,
      dateToIso: null,
      result: available,
    };
  }

  const yearRange = getTrialBusinessYearUtcRange(latestYear);
  if (!yearRange) {
    throw new Error("Failed to build admin trial year range.");
  }

  const result = await searchAdminTrialsDb({
    query: input.query,
    dateFrom: yearRange.start,
    dateTo: yearRange.endExclusive,
    page: input.page,
    pageSize: input.pageSize,
    sort: input.sort,
  });
  return {
    mode: "year",
    year: latestYear,
    dateFromIso: null,
    dateToIso: null,
    result,
  };
}
