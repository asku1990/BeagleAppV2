"use server";

import type {
  DeleteAdminDogRequest,
  DeleteAdminDogResponse,
} from "@beagle/contracts";
import { deleteAdminDog } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type DeleteAdminDogActionResult = {
  data: DeleteAdminDogResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function deleteAdminDogAction(
  input: DeleteAdminDogRequest,
): Promise<DeleteAdminDogActionResult> {
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

  const result = await deleteAdminDog(input, {
    actorUserId: currentUser.id,
    actorSessionId: currentUser.sessionId,
    source: "WEB",
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
