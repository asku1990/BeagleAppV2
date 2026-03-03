"use client";

import type {
  CreateAdminUserRequest,
  CreateAdminUserResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminUserAction } from "@/app/actions/admin/users/manage/create-admin-user";
import { AdminMutationError } from "./mutation-error";
import { adminUsersQueryKey } from "./query-keys";

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAdminUserResponse,
    AdminMutationError,
    CreateAdminUserRequest
  >({
    mutationFn: async (input) => {
      const result = await createAdminUserAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to create admin user.",
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
