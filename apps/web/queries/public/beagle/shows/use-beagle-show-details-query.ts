"use client";

import { useQuery } from "@tanstack/react-query";
import { getBeagleShowDetailsAction } from "@/app/actions/public/beagle/shows/get-show-details";
import { beagleShowDetailsQueryKey } from "./query-keys";

class BeagleShowDetailsQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BeagleShowDetailsQueryError";
    this.status = status;
  }
}

export function useBeagleShowDetailsQuery(showId: string) {
  const normalizedShowId = showId.trim();
  return useQuery({
    queryKey: beagleShowDetailsQueryKey(normalizedShowId),
    queryFn: async () => {
      const result = await getBeagleShowDetailsAction(normalizedShowId);
      if (result.hasError || !result.data) {
        throw new BeagleShowDetailsQueryError(
          result.error ?? "Failed to load show details.",
          result.status,
        );
      }
      return result.data;
    },
    enabled: normalizedShowId.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
