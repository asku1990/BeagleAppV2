"use client";

import type { AdminDogColorLookupOption } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminDogColorOptionsAction } from "@/app/actions/admin/dogs/lookups/get-admin-dog-color-options";
import { adminDogColorOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";

export function useAdminDogColorOptionsQuery(enabled = true) {
  return useQuery<AdminDogColorLookupOption[]>({
    queryKey: adminDogColorOptionsQueryKey(),
    queryFn: async () => {
      const result = await getAdminDogColorOptionsAction();
      if (result.hasError || !result.data) {
        throw new Error("Failed to load dog color options.");
      }

      return result.data.items;
    },
    staleTime: 300_000,
    refetchOnWindowFocus: true,
    enabled,
  });
}
