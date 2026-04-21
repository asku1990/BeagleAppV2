import { searchAdminTrialsDb } from "@beagle/db";
import type { ParsedAdminTrialEventSearchInput } from "./parse-admin-trial-event-search-input";
import type { AdminTrialEventSearchResponseDb } from "@beagle/db";

export async function resolveAdminTrialEventSearchResponseDb(
  input: ParsedAdminTrialEventSearchInput,
): Promise<AdminTrialEventSearchResponseDb> {
  if (input.mode === "year") {
    return searchAdminTrialsDb({
      mode: "year",
      query: input.query,
      year: input.year ?? undefined,
      page: input.page,
      pageSize: input.pageSize,
      sort: input.sort,
    });
  }

  if (input.mode === "range") {
    return searchAdminTrialsDb({
      mode: "range",
      query: input.query,
      dateFrom: input.rangeFromDate ?? undefined,
      dateTo: input.rangeToExclusive ?? undefined,
      page: input.page,
      pageSize: input.pageSize,
      sort: input.sort,
    });
  }

  const available = await searchAdminTrialsDb({
    mode: "range",
    query: input.query,
    page: 1,
    pageSize: 1,
    sort: input.sort,
  });
  const latestYear = available.availableYears[0];
  if (!latestYear) {
    return {
      ...available,
      mode: "year",
      year: null,
    };
  }

  return searchAdminTrialsDb({
    mode: "year",
    query: input.query,
    year: latestYear,
    page: input.page,
    pageSize: input.pageSize,
    sort: input.sort,
  });
}
