"use client";

import type {
  DeleteAdminDogDiseaseRequest,
  DeleteAdminDogDiseaseResponse,
} from "@beagle/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminDogDiseaseAction } from "@/app/actions/admin/dogs/diseases";
import { beagleDogsQueryKeyRoot } from "@/queries/public/beagle/dogs/profile/query-keys";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminDogProfileQueryKeyRoot } from "@web/queries/admin/dogs/profile/query-keys";
import { adminDogDiseasesQueryKeyRoot } from "./query-keys";

export function useDeleteAdminDogDiseaseMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    DeleteAdminDogDiseaseResponse,
    AdminMutationError,
    DeleteAdminDogDiseaseRequest
  >({
    mutationFn: async (input) => {
      const result = await deleteAdminDogDiseaseAction(input);
      if (result.hasError || !result.data) {
        throw new AdminMutationError(
          result.message ?? "Failed to delete dog disease.",
          result.errorCode,
        );
      }

      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminDogDiseasesQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: adminDogProfileQueryKeyRoot,
      });
      await queryClient.invalidateQueries({
        queryKey: beagleDogsQueryKeyRoot,
      });
    },
  });
}
