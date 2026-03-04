"use server";

import type {
  DeleteAdminUserRequest,
  DeleteAdminUserResponse,
} from "@beagle/contracts";
import { deleteAdminUser } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

export type DeleteAdminUserActionResult = {
  data: DeleteAdminUserResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function deleteAdminUserAction(
  input: DeleteAdminUserRequest,
): Promise<DeleteAdminUserActionResult> {
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

  const result = await deleteAdminUser({
    userId: input.userId,
    currentUserId: currentUser.id,
    auditContext: {
      actorUserId: currentUser.id,
      actorSessionId: currentUser.sessionId,
      source: "WEB",
    },
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
