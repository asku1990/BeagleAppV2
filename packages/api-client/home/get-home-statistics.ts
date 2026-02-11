import type { HomeStatisticsResponse } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function getHomeStatistics(request: RequestFn) {
  return request<HomeStatisticsResponse>("/api/v1/home/statistics", {
    method: "GET",
  });
}
