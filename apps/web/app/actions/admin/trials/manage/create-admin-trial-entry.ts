"use server";

import type {
  AdminTrialEntryValidationIssue,
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
  validationIssue?: AdminTrialEntryValidationIssue;
};

const VALIDATION_REASONS = new Set<AdminTrialEntryValidationIssue["reason"]>([
  "invalid_write_shape",
  "invalid_koetyyppi",
  "invalid_huomautus",
  "invalid_entry_integer",
  "invalid_entry_number",
  "missing_eras",
  "invalid_era_number",
  "duplicate_eras",
  "non_continuous_eras",
  "invalid_era_integer",
  "invalid_era_number_field",
  "invalid_lisatieto_code",
  "duplicate_lisatieto_key",
  "invalid_lisatieto_era",
  "duplicate_lisatieto_era_value",
  "invalid_lisatieto_order",
]);

function toValidationIssue(
  value: unknown,
): AdminTrialEntryValidationIssue | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Partial<AdminTrialEntryValidationIssue>;
  if (
    !["entry", "eras", "additional_info"].includes(candidate.area ?? "") ||
    !candidate.reason ||
    !VALIDATION_REASONS.has(candidate.reason)
  )
    return undefined;
  return candidate as AdminTrialEntryValidationIssue;
}

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
    const validationIssue = toValidationIssue(result.body.details);
    return {
      data: null,
      hasError: true,
      errorCode: result.body.code,
      message: result.body.error,
      ...(validationIssue ? { validationIssue } : {}),
    };
  }
  return { data: result.body.data, hasError: false };
}
