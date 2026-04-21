import { toBusinessDateOnly } from "@server/core/date-only";
import type {
  AdminTrialEventSearchFilters,
  AdminTrialEventSearchResponse,
} from "@beagle/contracts";
import type {
  AdminTrialEventSearchResponseDb,
  AdminTrialEventSearchModeDb,
} from "@beagle/db";
import type { ParsedAdminTrialEventSearchInput } from "./parse-admin-trial-event-search-input";

function resolveFilters(
  input: ParsedAdminTrialEventSearchInput,
  result: AdminTrialEventSearchResponseDb,
): AdminTrialEventSearchFilters {
  const mode: AdminTrialEventSearchModeDb =
    input.mode != null
      ? input.mode
      : result.mode === "range"
        ? "range"
        : "year";

  if (input.mode === "year") {
    return {
      mode,
      year: input.year,
      dateFrom: null,
      dateTo: null,
    };
  }

  if (input.mode === "range") {
    return {
      mode,
      year: null,
      dateFrom: input.dateFromIso,
      dateTo: input.dateToIso,
    };
  }

  return {
    mode,
    year: result.year,
    dateFrom: null,
    dateTo: null,
  };
}

export function mapAdminTrialEventSearchResponse(
  input: ParsedAdminTrialEventSearchInput,
  result: AdminTrialEventSearchResponseDb,
): AdminTrialEventSearchResponse {
  return {
    filters: resolveFilters(input, result),
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
}
