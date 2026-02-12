"use client";

import type { HomeStatisticsResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getHomeStatisticsAction } from "@/app/actions/home/get-home-statistics";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export function useHomeStatisticsQuery() {
  return useQuery<HomeStatisticsResponse | null>({
    queryKey: ["home-statistics"],
    queryFn: async () => {
      const result = await getHomeStatisticsAction();
      if (result.hasError) {
        throw new Error("Failed to refresh home statistics.");
      }
      return result.data;
    },
    staleTime: REFRESH_INTERVAL_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
