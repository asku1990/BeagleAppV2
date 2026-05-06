"use client";

import type {
  UpdateAdminTrialEventRequest,
  UpdateAdminTrialEventResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminTrialEventAction } from "@/app/actions/admin/trials/manage/update-admin-trial-event";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useUpdateAdminTrialEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAdminTrialEventResponse,
    AdminMutationError,
    UpdateAdminTrialEventRequest
  >({
    mutationFn: async (input) => {
      const result = await updateAdminTrialEventAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update trial event.",
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
