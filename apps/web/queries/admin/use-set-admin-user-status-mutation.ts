"use client";

import type {
  SetAdminUserStatusRequest,
  SetAdminUserStatusResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAdminUserStatusAction } from "@/app/actions/admin/set-admin-user-status";
import { AdminMutationError } from "./mutation-error";
import { adminUsersQueryKey } from "./query-keys";

export function useSetAdminUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SetAdminUserStatusResponse,
    AdminMutationError,
    SetAdminUserStatusRequest
  >({
    mutationFn: async (input) => {
      const result = await setAdminUserStatusAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update admin user status.",
          result.errorCode,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
}
