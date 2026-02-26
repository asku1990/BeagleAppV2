"use client";

import type { BeagleSearchResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchDogsAction } from "@/app/actions/beagle-search/search-dogs";
import {
  parseBirthYearInput,
  type BeagleSearchQueryState,
} from "@/lib/beagle-search";
import { beagleSearchQueryKey } from "./query-keys";

export function useBeagleSearchQuery(state: BeagleSearchQueryState) {
  const birthYearFrom = parseBirthYearInput(state.birthYearFrom);
  const birthYearTo = parseBirthYearInput(state.birthYearTo);
  const hasSearchInput =
    state.ek.trim().length > 0 ||
    state.reg.trim().length > 0 ||
    state.name.trim().length > 0 ||
    birthYearFrom != null ||
    birthYearTo != null ||
    state.ekOnly ||
    state.sex !== "any" ||
    state.multipleRegsOnly;

  return useQuery<BeagleSearchResponse>({
    queryKey: beagleSearchQueryKey(state),
    enabled: hasSearchInput,
    queryFn: async () => {
      const result = await searchDogsAction({
        ek: state.ek,
        reg: state.reg,
        name: state.name,
        sex: state.sex === "any" ? undefined : state.sex,
        birthYearFrom,
        birthYearTo,
        ekOnly: state.ekOnly,
        multipleRegsOnly: state.multipleRegsOnly,
        page: state.page,
        pageSize: state.pageSize,
        sort: state.sort,
      });

      if (result.hasError || !result.data) {
        throw new Error(
          result.error ?? "Failed to load beagle search results.",
        );
      }

      return result.data;
    },
  });
}
