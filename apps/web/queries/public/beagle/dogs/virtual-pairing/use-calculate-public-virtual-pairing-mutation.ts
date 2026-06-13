"use client";

import type {
  CalculatePublicVirtualPairingRequest,
  CalculatePublicVirtualPairingResponse,
} from "@beagle/contracts";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useCalculatePublicVirtualPairingMutation() {
  return useMutation<
    CalculatePublicVirtualPairingResponse,
    Error,
    CalculatePublicVirtualPairingRequest
  >({
    mutationFn: async (input) => {
      const result = await apiClient.calculatePublicVirtualPairing(input);
      if (!result.ok) {
        throw new Error(
          result.error?.trim() || "Failed to calculate virtual pairing data.",
        );
      }
      return result.data;
    },
  });
}
