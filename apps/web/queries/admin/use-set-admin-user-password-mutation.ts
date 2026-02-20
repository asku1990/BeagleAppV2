"use client";

import type {
  SetAdminUserPasswordRequest,
  SetAdminUserPasswordResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAdminUserPasswordAction } from "@/app/actions/admin/set-admin-user-password";
import { AdminMutationError } from "./mutation-error";
import { adminUsersQueryKey } from "./query-keys";

export function useSetAdminUserPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    SetAdminUserPasswordResponse,
    AdminMutationError,
    SetAdminUserPasswordRequest
  >({
    mutationFn: async (input) => {
      const result = await setAdminUserPasswordAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to set admin user password.",
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
