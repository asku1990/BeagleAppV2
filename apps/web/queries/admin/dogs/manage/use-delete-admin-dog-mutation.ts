"use client";

import type {
  DeleteAdminDogRequest,
  DeleteAdminDogResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminDogAction } from "@/app/actions/admin/dogs/manage/delete-admin-dog";
import { AdminMutationError } from "@/queries/admin/dogs/manage/mutation-error";
import {
  adminDogBreederOptionsQueryKeyRoot,
  adminDogOwnerOptionsQueryKeyRoot,
  adminDogParentOptionsQueryKeyRoot,
  adminDogsQueryKeyRoot,
} from "./query-keys";
import {
  beagleNewestQueryKeyRoot,
  beagleSearchQueryKeyRoot,
} from "@/queries/public/beagle/search/query-keys";
import { homeStatisticsQueryKey } from "@/queries/public/home/statistics/query-keys";

export function useDeleteAdminDogMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminDogResponse,
    AdminMutationError,
    DeleteAdminDogRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminDogAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete dog.",
          result.errorCode,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminDogsQueryKeyRoot });
      await queryClient.invalidateQueries({
        queryKey: adminDogBreederOptionsQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: adminDogOwnerOptionsQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: adminDogParentOptionsQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: beagleSearchQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: beagleNewestQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: homeStatisticsQueryKey,
      });
    },
  });
}
