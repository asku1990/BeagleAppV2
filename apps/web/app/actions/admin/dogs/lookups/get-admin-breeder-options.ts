"use server";

import type {
  AdminBreederLookupResponse,
  AdminDogLookupRequest,
} from "@beagle/contracts";
import { listAdminBreederOptions } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type AdminBreederOptionsActionResult = {
  data: AdminBreederLookupResponse | null;
  hasError: boolean;
  errorCode?: string;
};

export async function getAdminBreederOptionsAction(
  input: AdminDogLookupRequest,
): Promise<AdminBreederOptionsActionResult> {
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

  const result = await listAdminBreederOptions(input, {
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
