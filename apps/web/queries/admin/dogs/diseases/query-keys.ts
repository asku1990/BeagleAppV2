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
  const diseaseGroupKey =
    filters.diseaseGroup === undefined
      ? "__default_group__"
      : filters.diseaseGroup === null
        ? "__all_groups__"
        : filters.diseaseGroup;

  return [
    ...adminDogDiseasesQueryKeyRoot,
    diseaseCodeKey,
    diseaseGroupKey,
    filters.query?.trim() ?? "",
    filters.page ?? 1,
  ] as const;
}
