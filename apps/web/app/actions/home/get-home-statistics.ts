"use server";

import type { HomeStatisticsResponse } from "@beagle/contracts";
import { statsService } from "@beagle/server";

export type HomeStatisticsActionResult = {
  data: HomeStatisticsResponse | null;
  hasError: boolean;
};

export async function getHomeStatisticsAction(): Promise<HomeStatisticsActionResult> {
  const result = await statsService.getHomeStatistics();
  if (!result.body.ok) {
    return { data: null, hasError: true };
  }

  return { data: result.body.data, hasError: false };
}
