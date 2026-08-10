"use client";

import type {
  DeleteAdminTrialEventRequest,
  DeleteAdminTrialEventResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminTrialEventAction } from "@/app/actions/admin/trials/manage/delete-admin-trial-event";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useDeleteAdminTrialEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminTrialEventResponse,
    AdminMutationError,
    DeleteAdminTrialEventRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminTrialEventAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete trial event.",
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
    },
  });
}
