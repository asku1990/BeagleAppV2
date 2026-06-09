import type { AdminDogDiseaseBrowseRequest } from "@beagle/contracts";

export const adminDogDiseasesQueryKeyRoot = ["admin-dogs", "diseases"] as const;

export function adminDogDiseasesQueryKey(
  filters: AdminDogDiseaseBrowseRequest,
) {
  const diseaseCodeKey =
    filters.diseaseCode === undefined
      ? "__default__"
      : filters.diseaseCode === null
        ? "__all__"
        : filters.diseaseCode;

  return [
    ...adminDogDiseasesQueryKeyRoot,
    diseaseCodeKey,
    filters.query?.trim() ?? "",
    filters.page ?? 1,
  ] as const;
}
