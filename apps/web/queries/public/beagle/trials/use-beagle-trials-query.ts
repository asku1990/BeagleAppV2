"use client";

import type {
  BeagleTrialSearchRequest,
  BeagleTrialSearchResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchBeagleTrialsAction } from "@/app/actions/public/beagle/trials/search-trials";
import { beagleTrialSearchQueryKey } from "./query-keys";

class BeagleTrialsQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BeagleTrialsQueryError";
    this.status = status;
  }
}

export function useBeagleTrialsQuery(input: BeagleTrialSearchRequest = {}) {
  return useQuery<BeagleTrialSearchResponse>({
    queryKey: beagleTrialSearchQueryKey(input),
    queryFn: async () => {
      const result = await searchBeagleTrialsAction(input);
      if (result.hasError || !result.data) {
        throw new BeagleTrialsQueryError(
          result.error ?? "Failed to load beagle trials.",
          result.status,
        );
      }
      return result.data;
    },
  });
}
