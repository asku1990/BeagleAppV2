"use client";

import type {
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAdminDogAction } from "@/app/actions/admin/dogs/update-admin-dog";
import { AdminMutationError } from "@/queries/admin/mutation-error";
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
import { homeStatisticsQueryKey } from "@/queries/home/query-keys";

export function useUpdateAdminDogMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateAdminDogResponse,
    AdminMutationError,
    UpdateAdminDogRequest
  >({
    mutationFn: async (input) => {
      const result = await updateAdminDogAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to update dog.",
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
