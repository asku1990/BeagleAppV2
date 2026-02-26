"use client";

import type { AdminDogListItem, AdminDogListRequest } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminDogsAction } from "@/app/actions/admin/dogs/get-admin-dogs";
import { adminDogsQueryKey } from "./query-keys";

export function useAdminDogsQuery(filters: AdminDogListRequest) {
  return useQuery<{
    items: AdminDogListItem[];
    total: number;
    totalPages: number;
    page: number;
  }>({
    queryKey: adminDogsQueryKey(filters),
    queryFn: async () => {
      const result = await getAdminDogsAction(filters);
      if (result.hasError || !result.data) {
        throw new Error("Failed to load admin dogs.");
      }

      return {
        items: result.data.items,
        total: result.data.total,
        totalPages: result.data.totalPages,
        page: result.data.page,
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
