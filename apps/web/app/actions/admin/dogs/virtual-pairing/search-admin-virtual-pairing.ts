"use server";

import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { searchAdminVirtualPairing } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type SearchAdminVirtualPairingActionResult = {
  data: VirtualPairingSearchResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function searchAdminVirtualPairingAction(
  input: VirtualPairingSearchRequest,
): Promise<SearchAdminVirtualPairingActionResult> {
  const adminAccess = await requireAdminLayoutAccess();
  if (!adminAccess.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: adminAccess.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      message: "Admin access required.",
    };
  }

  const currentUser = await getSessionCurrentUser();
  if (!currentUser) {
    return {
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    };
  }

  const result = await searchAdminVirtualPairing(input, {
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
      message: result.body.error,
    };
  }

  return {
    data: result.body.data,
    hasError: false,
  };
}
