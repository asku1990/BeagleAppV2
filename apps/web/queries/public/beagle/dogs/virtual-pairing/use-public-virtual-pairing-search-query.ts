"use client";

import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { publicVirtualPairingSearchQueryKey } from "./query-keys";

export function usePublicVirtualPairingSearchQuery(
  filters: VirtualPairingSearchRequest,
  enabled: boolean,
) {
  return useQuery<VirtualPairingSearchResponse>({
    queryKey: publicVirtualPairingSearchQueryKey(filters),
    enabled,
    queryFn: async () => {
      const result = await apiClient.searchPublicVirtualPairing(filters);
      if (!result.ok) {
        const errorMessage = result.error?.trim();
        throw new Error(
          errorMessage && errorMessage.length > 0
            ? errorMessage
            : "Failed to load virtual pairing search results.",
        );
      }
      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
