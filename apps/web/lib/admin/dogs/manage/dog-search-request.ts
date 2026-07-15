import type { AdminDogListRequest } from "@beagle/contracts";

export function adminDogListRequestKeyParts(filters: AdminDogListRequest) {
  return [
    filters.query ?? "",
    filters.sex ?? null,
    filters.status ?? null,
    filters.page ?? 1,
    filters.pageSize ?? 20,
    filters.sort ?? "name-asc",
  ] as const;
}

export function shouldRefetchAdminDogSearch(
  appliedFilters: AdminDogListRequest | null,
  nextFilters: AdminDogListRequest,
): boolean {
  if (!appliedFilters) {
    return false;
  }

  const appliedKey = adminDogListRequestKeyParts(appliedFilters);
  const nextKey = adminDogListRequestKeyParts(nextFilters);

  return appliedKey.every((value, index) => Object.is(value, nextKey[index]));
}
