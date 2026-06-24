"use client";

import { createAdminDogsApiClient } from "@beagle/api-client";
import type { AdminDogColorLookupOption } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { adminDogColorOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";

const adminDogsApiClient = createAdminDogsApiClient();

export function useAdminDogColorOptionsQuery(enabled = true) {
  return useQuery<AdminDogColorLookupOption[]>({
    queryKey: adminDogColorOptionsQueryKey(),
    queryFn: async () => {
      const result = await adminDogsApiClient.listAdminDogColorOptions();
      if (!result.ok) {
        throw new Error("Failed to load dog color options.");
      }

      return result.data.items;
    },
    staleTime: 300_000,
    refetchOnWindowFocus: true,
    enabled,
  });
}
