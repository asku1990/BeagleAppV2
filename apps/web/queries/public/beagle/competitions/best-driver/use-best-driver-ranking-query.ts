"use client";

import type {
  BestDriverRankingRequest,
  BestDriverRankingResponse,
} from "@beagle/contracts";
import { createPublicCompetitionsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { bestDriverRankingQueryKey } from "./query-key";

const publicCompetitionsApiClient = createPublicCompetitionsApiClient();

export function useBestDriverRankingQuery(
  input: BestDriverRankingRequest = {},
) {
  return useQuery<BestDriverRankingResponse>({
    queryKey: bestDriverRankingQueryKey(input),
    queryFn: async () => {
      const result =
        await publicCompetitionsApiClient.getBestDriverRanking(input);
      if (!result.ok) {
        throw new Error(result.error || "Failed to load best driver ranking.");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
