"use client";

import type { HomeStatisticsResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getHomeStatisticsAction } from "@/app/actions/public/home/statistics/get-home-statistics";
import { homeStatisticsQueryKey } from "./query-keys";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useHomeStatisticsQuery() {
  return useQuery<HomeStatisticsResponse | null>({
    queryKey: homeStatisticsQueryKey,
    queryFn: async () => {
      const result = await getHomeStatisticsAction();
      if (result.hasError) {
        throw new Error("Failed to refresh home statistics.");
      }
      return result.data;
    },
    staleTime: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
