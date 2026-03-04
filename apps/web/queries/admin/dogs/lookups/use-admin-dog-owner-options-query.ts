"use client";

import type { AdminOwnerLookupOption } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminOwnerOptionsAction } from "@/app/actions/admin/dogs/lookups/get-admin-owner-options";
import { adminDogOwnerOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";

type UseAdminDogOwnerOptionsQueryInput = {
  query: string;
  limit?: number;
  enabled?: boolean;
};

export function useAdminDogOwnerOptionsQuery(
  input: UseAdminDogOwnerOptionsQueryInput,
) {
  const normalizedQuery = input.query.trim();
  const limit = input.limit ?? 100;

  return useQuery<AdminOwnerLookupOption[]>({
    queryKey: adminDogOwnerOptionsQueryKey(normalizedQuery, limit),
    queryFn: async () => {
      const result = await getAdminOwnerOptionsAction({
        query: normalizedQuery.length > 0 ? normalizedQuery : undefined,
        limit,
      });
      if (result.hasError || !result.data) {
        throw new Error("Failed to load owner options.");
      }

      return result.data.items;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: input.enabled ?? true,
  });
}
