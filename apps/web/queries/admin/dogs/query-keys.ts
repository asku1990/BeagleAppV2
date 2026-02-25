import type { AdminDogListRequest } from "@beagle/contracts";

export function adminDogsQueryKey(filters: AdminDogListRequest) {
  return [
    "admin-dogs",
    filters.query ?? "",
    filters.sex ?? null,
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "name-asc",
  ] as const;
}
