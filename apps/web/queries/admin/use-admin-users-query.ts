"use client";

import type { AdminUserListItem } from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { getAdminUsersAction } from "@/app/actions/admin/get-admin-users";
import { adminUsersQueryKey } from "./query-keys";

export function useAdminUsersQuery() {
  return useQuery<AdminUserListItem[]>({
    queryKey: adminUsersQueryKey,
    queryFn: async () => {
      const result = await getAdminUsersAction();
      if (result.hasError || !result.data) {
        throw new Error("Failed to load admin users.");
      }
      return result.data.items;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
