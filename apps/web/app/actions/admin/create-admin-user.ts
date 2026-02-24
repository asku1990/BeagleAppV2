"use server";

import type {
  CreateAdminUserRequest,
  CreateAdminUserResponse,
} from "@beagle/contracts";
import { createAdminUser } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

export type CreateAdminUserActionResult = {
  data: CreateAdminUserResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function createAdminUserAction(
  input: CreateAdminUserRequest,
): Promise<CreateAdminUserActionResult> {
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

  const result = await createAdminUser(input, {
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
