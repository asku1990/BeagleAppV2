"use client";

import type { BeagleSearchRow } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getNewestDogsAction } from "@/app/actions/beagle-search/get-newest-dogs";
import { beagleNewestQueryKey } from "./query-keys";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useBeagleNewestQuery(limit = 5) {
  return useQuery<BeagleSearchRow[]>({
    queryKey: beagleNewestQueryKey(limit),
    queryFn: async () => {
      const result = await getNewestDogsAction({ limit });
      if (result.hasError || !result.data) {
        throw new Error(result.error ?? "Failed to load newest beagles.");
      }
      return result.data.items;
    },
    staleTime: REFRESH_INTERVAL_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
