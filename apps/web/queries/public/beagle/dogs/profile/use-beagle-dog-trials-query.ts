"use client";

import type { BeagleDogTrialsDto } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { beagleDogTrialsQueryKey } from "./dog-trials-query-keys";

class DogTrialsQueryError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DogTrialsQueryError";
    this.status = status;
  }
}

type DogTrialsRouteResponse =
  | { ok: true; data: BeagleDogTrialsDto }
  | { ok: false; error: string; code?: string };

function buildDogTrialsUrl(dogId: string): string {
  return `/api/beagle/dogs/${encodeURIComponent(dogId)}/trials`;
}

export function useBeagleDogTrialsQuery(dogId: string) {
  const normalizedDogId = dogId.trim();
  return useQuery<BeagleDogTrialsDto>({
    queryKey: beagleDogTrialsQueryKey(normalizedDogId),
    queryFn: async () => {
      let response: Response;
      try {
        response = await fetch(buildDogTrialsUrl(normalizedDogId), {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });
      } catch {
        throw new DogTrialsQueryError("Failed to load dog trials.", 500);
      }

      let payload: DogTrialsRouteResponse;
      try {
        payload = (await response.json()) as DogTrialsRouteResponse;
      } catch {
        throw new DogTrialsQueryError("Failed to load dog trials.", 500);
      }

      if (!response.ok || !payload.ok) {
        throw new DogTrialsQueryError(
          !payload.ok && payload.error
            ? payload.error
            : "Failed to load dog trials.",
          response.status,
        );
      }
      return payload.data;
    },
    enabled: normalizedDogId.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
