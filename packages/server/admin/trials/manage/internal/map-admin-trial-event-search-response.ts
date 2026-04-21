import { toBusinessDateOnly } from "@server/core/date-only";
import type {
  AdminTrialEventSearchFilters,
  AdminTrialEventSearchResponse,
} from "@beagle/contracts";
import type { AdminTrialEventSearchResponseDb } from "@beagle/db";
import type { ParsedAdminTrialEventSearchInput } from "./parse-admin-trial-event-search-input";
import type { ResolvedAdminTrialEventSearch } from "./resolve-admin-trial-event-defaults";
import { toTrialBusinessYear } from "../../../../trials/core/business-date";

function resolveFilters(
  input: ParsedAdminTrialEventSearchInput,
  resolved: ResolvedAdminTrialEventSearch,
): AdminTrialEventSearchFilters {
  const mode = input.mode ?? resolved.mode;

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
    year: resolved.year,
    dateFrom: null,
    dateTo: null,
  };
}

export function mapAdminTrialEventSearchResponse(
  input: ParsedAdminTrialEventSearchInput,
  resolved: ResolvedAdminTrialEventSearch,
): AdminTrialEventSearchResponse {
  const result = resolved.result;
  const availableYears = Array.from(
    new Set(
      result.availableEventDates.map((value) => toTrialBusinessYear(value)),
    ),
  ).sort((left, right) => right - left);

  return {
    filters: resolveFilters(input, resolved),
    availableYears,
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
