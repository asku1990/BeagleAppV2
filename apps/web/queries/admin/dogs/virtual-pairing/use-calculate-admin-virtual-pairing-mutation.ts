"use client";

import type {
  CalculateAdminVirtualPairingRequest,
  CalculateAdminVirtualPairingResponse,
} from "@beagle/contracts";
import { useMutation } from "@tanstack/react-query";
import { calculateAdminVirtualPairingAction } from "@/app/actions/admin/dogs/virtual-pairing";
import { AdminMutationError } from "@/queries/admin/mutation-error";

export function useCalculateAdminVirtualPairingMutation() {
  return useMutation<
    CalculateAdminVirtualPairingResponse,
    AdminMutationError,
    CalculateAdminVirtualPairingRequest
  >({
    mutationFn: async (input) => {
      const result = await calculateAdminVirtualPairingAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to calculate virtual pairing.",
          result.errorCode,
        );
      }

      return result.data;
    },
  });
}
