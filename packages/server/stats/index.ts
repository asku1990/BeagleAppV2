import { getHomeStatistics } from "./get-home-statistics";

export function createStatsService() {
  return {
    getHomeStatistics,
  };
}

export const statsService = createStatsService();
