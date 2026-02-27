"use client";

import { useQuery } from "@tanstack/react-query";
import { getDogProfileAction } from "@/app/actions/public/beagle/dogs/profile/get-dog-profile";
import { beagleDogProfileQueryKey } from "./query-keys";

class DogProfileQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DogProfileQueryError";
    this.status = status;
  }
}

export function useBeagleDogProfileQuery(dogId: string) {
  return useQuery({
    queryKey: beagleDogProfileQueryKey(dogId),
    queryFn: async () => {
      const result = await getDogProfileAction(dogId);
      if (result.hasError) {
        throw new DogProfileQueryError(
          result.error || "Failed to load dog profile.",
          result.status,
        );
      }
      return result.data!;
    },
    enabled: !!dogId,
    staleTime: 1000 * 60 * 5,
  });
}
