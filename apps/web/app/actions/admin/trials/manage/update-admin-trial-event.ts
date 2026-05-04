"use server";

import type {
  UpdateAdminTrialEventRequest,
  UpdateAdminTrialEventResponse,
} from "@beagle/contracts";
import { updateAdminTrialEvent } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type UpdateAdminTrialEventActionResult = {
  data: UpdateAdminTrialEventResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function updateAdminTrialEventAction(
  input: UpdateAdminTrialEventRequest,
): Promise<UpdateAdminTrialEventActionResult> {
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

  const result = await updateAdminTrialEvent(
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
