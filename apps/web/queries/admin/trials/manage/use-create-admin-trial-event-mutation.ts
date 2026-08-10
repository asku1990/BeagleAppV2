"use client";

import type {
  CreateAdminTrialEventRequest,
  CreateAdminTrialEventResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminTrialEventAction } from "@/app/actions/admin/trials/manage/create-admin-trial-event";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useCreateAdminTrialEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAdminTrialEventResponse,
    AdminMutationError,
    CreateAdminTrialEventRequest
  >({
    mutationFn: async (input) => {
      const result = await createAdminTrialEventAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to create trial event.",
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
