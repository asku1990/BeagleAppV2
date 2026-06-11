"use server";

import type {
  CalculateAdminDogInbreedingRequest,
  CalculateAdminDogInbreedingResponse,
} from "@beagle/contracts";
import { calculateAdminDogInbreeding } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type CalculateAdminDogInbreedingActionResult = {
  data: CalculateAdminDogInbreedingResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function calculateAdminDogInbreedingAction(
  input: CalculateAdminDogInbreedingRequest,
): Promise<CalculateAdminDogInbreedingActionResult> {
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

  const result = await calculateAdminDogInbreeding(input, {
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
