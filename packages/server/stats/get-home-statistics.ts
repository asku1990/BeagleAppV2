import type { HomeStatisticsResponse } from "@beagle/contracts";
import { getHomeStatisticsSnapshot } from "@beagle/db";
import type { ServiceResult } from "../shared/result";
import { toHomeStatisticsResponse } from "./to-home-statistics-response";

export async function getHomeStatistics(): Promise<
  ServiceResult<HomeStatisticsResponse>
> {
  try {
    const snapshot = await getHomeStatisticsSnapshot();
    return {
      status: 200,
      body: {
        ok: true,
        data: toHomeStatisticsResponse(snapshot),
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load statistics.",
      },
    };
  }
}
