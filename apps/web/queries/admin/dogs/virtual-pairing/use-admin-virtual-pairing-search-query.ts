"use client";

import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { searchAdminVirtualPairingAction } from "@/app/actions/admin/dogs/virtual-pairing";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminVirtualPairingSearchQueryKey } from "./query-keys";

export function useAdminVirtualPairingSearchQuery(
  filters: VirtualPairingSearchRequest,
  enabled: boolean,
) {
  return useQuery<VirtualPairingSearchResponse>({
    queryKey: adminVirtualPairingSearchQueryKey(filters),
    enabled,
    queryFn: async () => {
      const result = await searchAdminVirtualPairingAction(filters);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to load virtual pairing search results.",
          result.errorCode,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
