"use client";

import type {
  CalculatePublicVirtualPairingRequest,
  CalculatePublicVirtualPairingResponse,
} from "@beagle/contracts";
import { useMutation } from "@tanstack/react-query";
import { calculatePublicVirtualPairingAction } from "@/app/actions/public/beagle/dogs/virtual-pairing/calculate-virtual-pairing";

export function useCalculatePublicVirtualPairingMutation() {
  return useMutation<
    CalculatePublicVirtualPairingResponse,
    Error,
    CalculatePublicVirtualPairingRequest
  >({
    mutationFn: async (input) => {
      const result = await calculatePublicVirtualPairingAction(input);
      if (result.hasError || !result.data) {
        throw new Error(
          result.error ?? "Failed to calculate virtual pairing data.",
        );
      }
      return result.data;
    },
  });
}
