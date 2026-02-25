"use server";

import type {
  AdminDogListRequest,
  AdminDogListResponse,
} from "@beagle/contracts";
import { listAdminDogs } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type AdminDogsActionResult = {
  data: AdminDogListResponse | null;
  hasError: boolean;
  errorCode?: string;
};

export async function getAdminDogsAction(
  input: AdminDogListRequest,
): Promise<AdminDogsActionResult> {
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

  const result = await listAdminDogs(input, {
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
