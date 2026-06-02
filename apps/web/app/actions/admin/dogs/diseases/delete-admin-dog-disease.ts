"use server";

import type {
  DeleteAdminDogDiseaseRequest,
  DeleteAdminDogDiseaseResponse,
} from "@beagle/contracts";
import { deleteAdminDogDisease } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

export type DeleteAdminDogDiseaseActionResult = {
  data: DeleteAdminDogDiseaseResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function deleteAdminDogDiseaseAction(
  input: DeleteAdminDogDiseaseRequest,
): Promise<DeleteAdminDogDiseaseActionResult> {
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

  const result = await deleteAdminDogDisease(
    input,
    {
      id: currentUser.id,
      email: currentUser.email,
      username: currentUser.name,
      role: currentUser.role,
    },
    {
      actorUserId: currentUser.id,
      actorSessionId: currentUser.sessionId,
      source: "WEB",
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
