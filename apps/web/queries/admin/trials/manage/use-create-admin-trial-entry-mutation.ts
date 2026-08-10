"use client";

import type {
  CreateAdminTrialEntryRequest,
  CreateAdminTrialEntryResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminTrialEntryAction } from "@/app/actions/admin/trials/manage/create-admin-trial-entry";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { beagleDogsQueryKeyRoot } from "@/queries/public/beagle/dogs/profile/query-keys";
import { beagleTrialsQueryKeyRoot } from "@/queries/public/beagle/trials/query-keys";
import { homeStatisticsQueryKey } from "@/queries/public/home/statistics/query-keys";
import {
  adminTrialEventQueryKeyRoot,
  adminTrialEventsQueryKeyRoot,
} from "./query-keys";

export function useCreateAdminTrialEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAdminTrialEntryResponse,
    AdminMutationError,
    CreateAdminTrialEntryRequest
  >({
    mutationFn: async (input) => {
      const result = await createAdminTrialEntryAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to create trial entry.",
          result.errorCode,
          result.validationIssue,
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminTrialEventsQueryKeyRoot,
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: adminTrialEventQueryKeyRoot,
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: beagleTrialsQueryKeyRoot,
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: beagleDogsQueryKeyRoot,
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: homeStatisticsQueryKey,
          refetchType: "all",
        }),
      ]);
    },
  });
}
