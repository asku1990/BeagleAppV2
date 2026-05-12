"use client";

import type {
  CalculateAdminDogInbreedingRequest,
  CalculateAdminDogInbreedingResponse,
} from "@beagle/contracts";
import { useMutation } from "@tanstack/react-query";
import { calculateAdminDogInbreedingAction } from "@/app/actions/admin/dogs/manage/calculate-admin-dog-inbreeding";
import { AdminMutationError } from "@/queries/admin/mutation-error";

export function useCalculateAdminDogInbreedingMutation() {
  return useMutation<
    CalculateAdminDogInbreedingResponse,
    AdminMutationError,
    CalculateAdminDogInbreedingRequest
  >({
    mutationFn: async (input) => {
      const result = await calculateAdminDogInbreedingAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to calculate inbreeding coefficient.",
          result.errorCode,
        );
      }

      return result.data;
    },
  });
}
