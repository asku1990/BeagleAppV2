"use client";

import type {
  BeagleShowSearchRequest,
  BeagleShowSearchResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchBeagleShowsAction } from "@/app/actions/public/beagle/shows/search-shows";
import { beagleShowSearchQueryKey } from "./query-keys";

class BeagleShowsQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BeagleShowsQueryError";
    this.status = status;
  }
}

export function useBeagleShowsQuery(input: BeagleShowSearchRequest = {}) {
  return useQuery<BeagleShowSearchResponse>({
    queryKey: beagleShowSearchQueryKey(input),
    queryFn: async () => {
      const result = await searchBeagleShowsAction(input);
      if (result.hasError || !result.data) {
        throw new BeagleShowsQueryError(
          result.error ?? "Failed to load beagle shows.",
          result.status,
        );
      }
      return result.data;
    },
  });
}
