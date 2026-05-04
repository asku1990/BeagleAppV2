"use client";

import type {
  UpdateAdminTrialEntryRequest,
  UpdateAdminTrialEntryResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminTrialEntryAction } from "@/app/actions/admin/trials/manage/update-admin-trial-entry";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useUpdateAdminTrialEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAdminTrialEntryResponse,
    AdminMutationError,
    UpdateAdminTrialEntryRequest
  >({
    mutationFn: async (input) => {
      const result = await updateAdminTrialEntryAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update trial entry.",
          result.errorCode,
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminTrialEventsQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: adminTrialEventQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: beagleTrialsQueryKeyRoot,
      });
    },
  });
}
