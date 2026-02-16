"use client";

import type { BeagleSearchResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchDogsAction } from "@/app/actions/beagle-search/search-dogs";
import {
  BEAGLE_PAGE_SIZE,
  parseBirthYearInput,
  type BeagleSearchQueryState,
} from "@/lib/beagle-search";

export function useBeagleSearchQuery(state: BeagleSearchQueryState) {
  const birthYearFrom = parseBirthYearInput(state.birthYearFrom);
  const birthYearTo = parseBirthYearInput(state.birthYearTo);
  const hasSearchInput =
    state.ek.trim().length > 0 ||
    state.reg.trim().length > 0 ||
    state.name.trim().length > 0 ||
    birthYearFrom != null ||
    birthYearTo != null ||
    state.sex !== "any" ||
    state.multipleRegsOnly;

  return useQuery<BeagleSearchResponse>({
    queryKey: [
      "beagle-search",
      state.ek,
      state.reg,
      state.name,
      state.sex,
      state.birthYearFrom,
      state.birthYearTo,
      state.multipleRegsOnly,
      state.page,
      state.sort,
    ],
    enabled: hasSearchInput,
    queryFn: async () => {
      const result = await searchDogsAction({
        ek: state.ek,
        reg: state.reg,
        name: state.name,
        sex: state.sex === "any" ? undefined : state.sex,
        birthYearFrom,
        birthYearTo,
        multipleRegsOnly: state.multipleRegsOnly,
        page: state.page,
        pageSize: BEAGLE_PAGE_SIZE,
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
