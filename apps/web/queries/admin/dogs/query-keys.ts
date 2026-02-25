import type { AdminDogListRequest } from "@beagle/contracts";

export const adminDogsQueryKeyRoot = ["admin-dogs"] as const;

export function adminDogsQueryKey(filters: AdminDogListRequest) {
  return [
    ...adminDogsQueryKeyRoot,
    filters.query ?? "",
    filters.sex ?? null,
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "name-asc",
  ] as const;
}
