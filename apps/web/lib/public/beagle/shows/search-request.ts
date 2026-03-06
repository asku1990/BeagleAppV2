import type { BeagleShowSearchRequest } from "@beagle/contracts";
import { normalizeIsoDateOnlyInput } from "./date";
import type { BeagleShowsQueryState } from "./types";

export function parseShowYearInput(
  input: string | null | undefined,
): number | undefined {
  const trimmed = (input ?? "").trim();
  if (!/^\d{4}$/.test(trimmed)) {
    return undefined;
  }

  const year = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) {
    return undefined;
  }

  return year;
}

export function toBeagleShowSearchRequest(
  state: BeagleShowsQueryState,
): BeagleShowSearchRequest {
  const base: BeagleShowSearchRequest = {
    page: state.page,
    pageSize: state.pageSize,
    sort: state.sort,
  };

  if (state.mode === "range") {
    return {
      ...base,
      dateFrom: normalizeIsoDateOnlyInput(state.dateFrom) || undefined,
      dateTo: normalizeIsoDateOnlyInput(state.dateTo) || undefined,
    };
  }

  return {
    ...base,
    year: parseShowYearInput(state.year),
  };
}
