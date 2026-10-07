import type { BeagleTrialSearchRequest } from "@beagle/contracts";
import { normalizeIsoDateOnlyInput } from "./date";
import type { BeagleTrialsQueryState } from "./types";

export function parseTrialSeasonInput(
  input: string | null | undefined,
): string | undefined {
  const trimmed = (input ?? "").trim();
  const match = trimmed.match(/^(\d{4})-(\d{4})$/);
  if (
    !match ||
    Number.parseInt(match[2], 10) !== Number.parseInt(match[1], 10) + 1
  ) {
    return undefined;
  }
  const year = Number.parseInt(match[1], 10);
  if (year < 1900 || year > 2100) {
    return undefined;
  }
  return trimmed;
}

export function toBeagleTrialSearchRequest(
  state: BeagleTrialsQueryState,
): BeagleTrialSearchRequest {
  const base: BeagleTrialSearchRequest = {
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
    season: parseTrialSeasonInput(state.season),
  };
}
