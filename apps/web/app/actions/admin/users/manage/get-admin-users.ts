"use server";

import type { AdminUsersResponse } from "@beagle/contracts";
import { listAdminUsers } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

export type AdminUsersActionResult = {
  data: AdminUsersResponse | null;
  hasError: boolean;
  errorCode?: string;
};

export async function getAdminUsersAction(): Promise<AdminUsersActionResult> {
  const adminAccess = await requireAdminLayoutAccess();
  if (!adminAccess.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: adminAccess.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
    };
  }

  const result = await listAdminUsers();
  if (!result.body.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: result.body.code,
    };
  }

  return {
    data: result.body.data,
    hasError: false,
  };
}
