import type { AdminShowSearchRequest } from "@beagle/contracts";

export const adminShowEventsQueryKeyRoot = ["admin-shows"] as const;
export const adminShowEventQueryKeyRoot = ["admin-shows", "event"] as const;

export function adminShowEventsQueryKey(filters: AdminShowSearchRequest) {
  return [
    ...adminShowEventsQueryKeyRoot,
    filters.query ?? "",
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "date-desc",
  ] as const;
}

export function adminShowEventQueryKey(showId: string) {
  return [...adminShowEventQueryKeyRoot, showId] as const;
}
