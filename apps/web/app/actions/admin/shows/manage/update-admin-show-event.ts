"use server";

import type {
  UpdateAdminShowEventRequest,
  UpdateAdminShowEventResponse,
} from "@beagle/contracts";
import { updateAdminShowEvent } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type UpdateAdminShowEventActionResult = {
  data: UpdateAdminShowEventResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function updateAdminShowEventAction(
  input: UpdateAdminShowEventRequest,
): Promise<UpdateAdminShowEventActionResult> {
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

  const result = await updateAdminShowEvent(
    input,
    {
      id: currentUser.id,
      email: currentUser.email,
      username: null,
      role: currentUser.role,
    },
    {
      actorUserId: currentUser.id,
    },
  );
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
