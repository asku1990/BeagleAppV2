import { getHomeStatistics } from "./statistics";

export function createStatsService() {
  return {
    getHomeStatistics,
  };
}

export const statsService = createStatsService();
