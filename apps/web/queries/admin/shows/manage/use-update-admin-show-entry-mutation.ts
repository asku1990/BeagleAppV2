"use client";

import type {
  UpdateAdminShowEntryRequest,
  UpdateAdminShowEntryResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminShowEntryAction } from "@/app/actions/admin/shows/manage/update-admin-show-entry";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "./query-keys";

export function useUpdateAdminShowEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAdminShowEntryResponse,
    AdminMutationError,
    UpdateAdminShowEntryRequest
  >({
    mutationFn: async (input) => {
      const result = await updateAdminShowEntryAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update show entry.",
          result.errorCode,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminShowEventsQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: adminShowEventQueryKeyRoot,
      });
    },
  });
}
