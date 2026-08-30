import type { BestDriverRankingRequest } from "@beagle/contracts";

export const bestDriverRankingQueryKey = (
  input: BestDriverRankingRequest = {},
) => ["beagle", "competitions", "best-driver", input.season ?? null] as const;
