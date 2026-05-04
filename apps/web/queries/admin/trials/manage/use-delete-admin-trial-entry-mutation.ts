"use client";

import type {
  DeleteAdminTrialEntryRequest,
  DeleteAdminTrialEntryResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminTrialEntryAction } from "@/app/actions/admin/trials/manage/delete-admin-trial-entry";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useDeleteAdminTrialEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminTrialEntryResponse,
    AdminMutationError,
    DeleteAdminTrialEntryRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminTrialEntryAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete trial entry.",
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
