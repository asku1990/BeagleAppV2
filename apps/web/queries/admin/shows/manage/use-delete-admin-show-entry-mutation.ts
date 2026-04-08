"use client";

import type {
  DeleteAdminShowEntryRequest,
  DeleteAdminShowEntryResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminShowEntryAction } from "@/app/actions/admin/shows/manage/delete-admin-show-entry";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "./query-keys";

export function useDeleteAdminShowEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminShowEntryResponse,
    AdminMutationError,
    DeleteAdminShowEntryRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminShowEntryAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete show entry.",
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
