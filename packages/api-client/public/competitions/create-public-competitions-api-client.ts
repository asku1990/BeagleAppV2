import type { BestDriverRankingRequest } from "@beagle/contracts";
import type { ClientOptions } from "@api-client/core/client-options";
import { createRequest } from "@api-client/core/request";
import { getBestDriverRanking } from "./get-best-driver-ranking";

export function createPublicCompetitionsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);
  return {
    getBestDriverRanking(input: BestDriverRankingRequest = {}) {
      return getBestDriverRanking(request, input);
    },
  };
}
