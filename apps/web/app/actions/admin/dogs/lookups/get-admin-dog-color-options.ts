"use server";

import type { AdminDogColorLookupResponse } from "@beagle/contracts";
import { listAdminDogColorOptions } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type AdminDogColorOptionsActionResult = {
  data: AdminDogColorLookupResponse | null;
  hasError: boolean;
  errorCode?: string;
};

export async function getAdminDogColorOptionsAction(): Promise<AdminDogColorOptionsActionResult> {
  const adminAccess = await requireAdminLayoutAccess();
  if (!adminAccess.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: adminAccess.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
    };
  }

  const currentUser = await getSessionCurrentUser();
  if (!currentUser) {
    return {
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
    };
  }

  const result = await listAdminDogColorOptions({
    id: currentUser.id,
    email: currentUser.email,
    username: currentUser.name,
    role: currentUser.role,
  });

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
