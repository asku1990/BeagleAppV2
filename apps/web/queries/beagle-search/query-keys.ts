import type { BeagleSearchQueryState } from "@/lib/beagle-search";

export const beagleSearchQueryKeyRoot = ["beagle-search"] as const;
export const beagleNewestQueryKeyRoot = ["beagle-newest"] as const;

export function beagleSearchQueryKey(state: BeagleSearchQueryState) {
  return [
    ...beagleSearchQueryKeyRoot,
    state.ek,
    state.reg,
    state.name,
    state.sex,
    state.birthYearFrom,
    state.birthYearTo,
    state.ekOnly,
    state.multipleRegsOnly,
    state.page,
    state.pageSize,
    state.sort,
  ] as const;
}

export function beagleNewestQueryKey(limit: number) {
  return [...beagleNewestQueryKeyRoot, limit] as const;
}
