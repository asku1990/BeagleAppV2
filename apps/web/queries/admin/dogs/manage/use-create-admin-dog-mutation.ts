"use client";

import type {
  CreateAdminDogRequest,
  CreateAdminDogResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdminDogAction } from "@/app/actions/admin/dogs/manage/create-admin-dog";
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

export function useCreateAdminDogMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateAdminDogResponse,
    AdminMutationError,
    CreateAdminDogRequest
  >({
    mutationFn: async (input) => {
      const result = await createAdminDogAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to create dog.",
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
