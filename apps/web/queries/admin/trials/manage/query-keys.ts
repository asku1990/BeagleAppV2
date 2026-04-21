import type { AdminTrialEventSearchRequest } from "@beagle/contracts";

export const adminTrialEventsQueryKeyRoot = ["admin-trials", "events"] as const;
export const adminTrialEventQueryKeyRoot = ["admin-trials", "event"] as const;

export function adminTrialEventsQueryKey(
  filters: AdminTrialEventSearchRequest,
) {
  return [
    ...adminTrialEventsQueryKeyRoot,
    filters.query ?? "",
    filters.year ?? "",
    filters.dateFrom ?? "",
    filters.dateTo ?? "",
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "date-desc",
  ] as const;
}

export function adminTrialEventQueryKey(trialEventId: string) {
  return [...adminTrialEventQueryKeyRoot, trialEventId] as const;
}
