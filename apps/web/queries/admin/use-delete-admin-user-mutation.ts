"use client";

import type {
  DeleteAdminUserRequest,
  DeleteAdminUserResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminUserAction } from "@/app/actions/admin/delete-admin-user";
import { AdminMutationError } from "./mutation-error";
import { adminUsersQueryKey } from "./query-keys";

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminUserResponse,
    AdminMutationError,
    DeleteAdminUserRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminUserAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete admin user.",
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
