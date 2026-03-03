"use client";

import type { AdminDogParentLookupOption } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminParentOptionsAction } from "@/app/actions/admin/dogs/lookups/get-admin-parent-options";
import { adminDogParentOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";

type UseAdminDogParentOptionsQueryInput = {
  query: string;
  limit?: number;
  enabled?: boolean;
};

export function useAdminDogParentOptionsQuery(
  input: UseAdminDogParentOptionsQueryInput,
) {
  const normalizedQuery = input.query.trim();
  const limit = input.limit ?? 100;

  return useQuery<AdminDogParentLookupOption[]>({
    queryKey: adminDogParentOptionsQueryKey(normalizedQuery, limit),
    queryFn: async () => {
      const result = await getAdminParentOptionsAction({
        query: normalizedQuery.length > 0 ? normalizedQuery : undefined,
        limit,
      });
      if (result.hasError || !result.data) {
        throw new Error("Failed to load parent options.");
      }

      return result.data.items;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    enabled: input.enabled ?? true,
  });
}
