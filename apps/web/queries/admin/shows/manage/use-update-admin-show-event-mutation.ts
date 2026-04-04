"use client";

import type {
  UpdateAdminShowEventRequest,
  UpdateAdminShowEventResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminShowEventAction } from "@/app/actions/admin/shows/manage/update-admin-show-event";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  adminShowEventQueryKeyRoot,
  adminShowEventsQueryKeyRoot,
} from "./query-keys";

export function useUpdateAdminShowEventMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAdminShowEventResponse,
    AdminMutationError,
    UpdateAdminShowEventRequest
  >({
    mutationFn: async (input) => {
      const result = await updateAdminShowEventAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update show event.",
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
