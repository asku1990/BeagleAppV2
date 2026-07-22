"use server";

import type {
  CreateAdminTrialEntryRequest,
  CreateAdminTrialEntryResponse,
} from "@beagle/contracts";
import { createAdminTrialEntry } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { getSessionCurrentUser } from "@/lib/server/current-user";

export type CreateAdminTrialEntryActionResult = {
  data: CreateAdminTrialEntryResponse | null;
  hasError: boolean;
  errorCode?: string;
  message?: string;
};

export async function createAdminTrialEntryAction(
  input: CreateAdminTrialEntryRequest,
): Promise<CreateAdminTrialEntryActionResult> {
  const access = await requireAdminLayoutAccess();
  if (!access.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: access.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
      message: "Admin access required.",
    };
  }
  const user = await getSessionCurrentUser();
  if (!user) {
    return {
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    };
  }
  const result = await createAdminTrialEntry(
    input,
    { id: user.id, email: user.email, username: null, role: user.role },
    { actorUserId: user.id },
  );
  if (!result.body.ok) {
    return {
      data: null,
      hasError: true,
      errorCode: result.body.code,
      message: result.body.error,
    };
  }
  return { data: result.body.data, hasError: false };
}
