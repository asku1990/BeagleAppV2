"use client";

import type { GetAdminDogDeleteImpactResponse } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminDogDeleteImpactAction } from "@/app/actions/admin/dogs/manage/get-delete-impact";
import { adminDogDeleteImpactQueryKey } from "./query-keys";

type UseAdminDogDeleteImpactQueryInput = {
  dogId: string | null;
  enabled?: boolean;
};

export function useAdminDogDeleteImpactQuery(
  input: UseAdminDogDeleteImpactQueryInput,
) {
  const dogId = input.dogId?.trim() ?? "";

  return useQuery<GetAdminDogDeleteImpactResponse>({
    queryKey: adminDogDeleteImpactQueryKey(dogId),
    queryFn: async () => {
      const result = await getAdminDogDeleteImpactAction({ id: dogId });
      if (result.hasError || !result.data) {
        throw new Error(result.message ?? "Failed to load dog delete impact.");
      }

      return result.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled: Boolean(dogId) && (input.enabled ?? true),
  });
}
