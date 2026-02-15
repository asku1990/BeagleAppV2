"use client";

import type { BeagleSearchResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchDogsAction } from "@/app/actions/beagle-search/search-dogs";
import {
  BEAGLE_PAGE_SIZE,
  type BeagleSearchQueryState,
} from "@/lib/beagle-search";

export function useBeagleSearchQuery(state: BeagleSearchQueryState) {
  const hasSearchInput =
    state.ek.trim().length > 0 ||
    state.reg.trim().length > 0 ||
    state.name.trim().length > 0;

  return useQuery<BeagleSearchResponse>({
    queryKey: [
      "beagle-search",
      state.ek,
      state.reg,
      state.name,
      state.page,
      state.sort,
    ],
    enabled: hasSearchInput,
    queryFn: async () => {
      const result = await searchDogsAction({
        ek: state.ek,
        reg: state.reg,
        name: state.name,
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
