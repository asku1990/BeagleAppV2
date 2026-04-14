import type { AdminTrialSearchRequest } from "@beagle/contracts";

export const adminTrialsQueryKeyRoot = ["admin-trials"] as const;
export const adminTrialQueryKeyRoot = ["admin-trials", "detail"] as const;

export function adminTrialsQueryKey(filters: AdminTrialSearchRequest) {
  return [
    ...adminTrialsQueryKeyRoot,
    filters.query ?? "",
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "date-desc",
  ] as const;
}

export function adminTrialQueryKey(trialId: string) {
  return [...adminTrialQueryKeyRoot, trialId] as const;
}
