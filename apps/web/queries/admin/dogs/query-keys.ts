import type { AdminDogListRequest } from "@beagle/contracts";

export const adminDogsQueryKeyRoot = ["admin-dogs"] as const;
export const adminDogBreederOptionsQueryKeyRoot = [
  "admin-dogs",
  "breeder-options",
] as const;
export const adminDogOwnerOptionsQueryKeyRoot = [
  "admin-dogs",
  "owner-options",
] as const;
export const adminDogParentOptionsQueryKeyRoot = [
  "admin-dogs",
  "parent-options",
] as const;

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

export function adminDogBreederOptionsQueryKey(query: string, limit: number) {
  return [...adminDogBreederOptionsQueryKeyRoot, query, limit] as const;
}

export function adminDogOwnerOptionsQueryKey(query: string, limit: number) {
  return [...adminDogOwnerOptionsQueryKeyRoot, query, limit] as const;
}

export function adminDogParentOptionsQueryKey(query: string, limit: number) {
  return [...adminDogParentOptionsQueryKeyRoot, query, limit] as const;
}
