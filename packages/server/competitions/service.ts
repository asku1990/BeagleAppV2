import type {
  BestDriverRankingRequest,
  BestDriverRankingResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../core/result";
import { getBestDriverRankingService } from "./best-driver";
import type { CompetitionsServiceLogContext } from "./types";

export function createCompetitionsService() {
  return {
    async getBestDriverRanking(
      input: BestDriverRankingRequest,
      context?: CompetitionsServiceLogContext,
    ): Promise<ServiceResult<BestDriverRankingResponse>> {
      return getBestDriverRankingService(input, context);
    },
  };
}

export const competitionsService = createCompetitionsService();
