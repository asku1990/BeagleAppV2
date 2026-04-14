import type { AdminTrialSearchRequest } from "@beagle/contracts";

export const adminTrialsQueryKeyRoot = ["admin-trials"] as const;

export function adminTrialsQueryKey(filters: AdminTrialSearchRequest) {
  return [
    ...adminTrialsQueryKeyRoot,
    filters.query ?? "",
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "date-desc",
  ] as const;
}
