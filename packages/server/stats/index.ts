import { getHomeStatistics } from "./home/statistics/get-home-statistics";

export function createStatsService() {
  return {
    getHomeStatistics,
  };
}

export const statsService = createStatsService();
