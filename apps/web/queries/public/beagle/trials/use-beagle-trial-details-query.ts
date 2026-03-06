"use client";

import { useQuery } from "@tanstack/react-query";
import { getBeagleTrialDetailsAction } from "@/app/actions/public/beagle/trials/get-trial-details";
import { beagleTrialDetailsQueryKey } from "./query-keys";

class BeagleTrialDetailsQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BeagleTrialDetailsQueryError";
    this.status = status;
  }
}

export function useBeagleTrialDetailsQuery(trialId: string) {
  const normalizedTrialId = trialId.trim();
  return useQuery({
    queryKey: beagleTrialDetailsQueryKey(normalizedTrialId),
    queryFn: async () => {
      const result = await getBeagleTrialDetailsAction(normalizedTrialId);
      if (result.hasError || !result.data) {
        throw new BeagleTrialDetailsQueryError(
          result.error ?? "Failed to load trial details.",
          result.status,
        );
      }
      return result.data;
    },
    enabled: normalizedTrialId.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
