"use client";

import type { AdminBreederLookupOption } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminBreederOptionsAction } from "@/app/actions/admin/dogs/get-admin-breeder-options";
import { adminDogBreederOptionsQueryKey } from "./query-keys";

type UseAdminDogBreederOptionsQueryInput = {
  query: string;
  limit?: number;
  enabled?: boolean;
};

export function useAdminDogBreederOptionsQuery(
  input: UseAdminDogBreederOptionsQueryInput,
) {
  const normalizedQuery = input.query.trim();
  const limit = input.limit ?? 100;

  return useQuery<AdminBreederLookupOption[]>({
    queryKey: adminDogBreederOptionsQueryKey(normalizedQuery, limit),
    queryFn: async () => {
      const result = await getAdminBreederOptionsAction({
        query: normalizedQuery.length > 0 ? normalizedQuery : undefined,
        limit,
      });
      if (result.hasError || !result.data) {
        throw new Error("Failed to load breeder options.");
      }

      return result.data.items;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: input.enabled ?? true,
  });
}
