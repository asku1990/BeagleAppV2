"use client";

import type { HomeStatisticsResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function fetchHomeStatistics(): Promise<HomeStatisticsResponse> {
  const result = await apiClient.getHomeStatistics();
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}

export function useHomeStatisticsQuery() {
  return useQuery({
    queryKey: ["home-statistics"],
    queryFn: fetchHomeStatistics,
    staleTime: REFRESH_INTERVAL_MS,
    refetchInterval: REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });
}
