import type {
  CurrentUserDto,
  UpdateAdminTrialEntryRequest,
  UpdateAdminTrialEntryResponse,
} from "@beagle/contracts";
import { updateAdminTrialEntryWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import {
  parseAdminTrialEntryWriteInput,
  type AdminTrialEntryWriteValidationIssue,
} from "./internal/parse-admin-trial-entry-write-input";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function validationFailure(
  issue: AdminTrialEntryWriteValidationIssue,
): ServiceResult<UpdateAdminTrialEntryResponse> {
  switch (issue.reason) {
    case "missing_eras":
      return badRequest("At least one era is required.", "INVALID_ERAS");
    case "invalid_era_number":
      return badRequest(
        "Era numbers must be positive safe integers.",
        "INVALID_ERAS",
      );
    case "duplicate_eras":
      return badRequest(
        "Duplicate era numbers are not allowed.",
        "DUPLICATE_ERAS",
      );
    case "non_continuous_eras":
      return badRequest(
        "Eras must be continuous starting from 1.",
        "INVALID_ERAS",
      );
    case "invalid_koetyyppi":
      return badRequest("Unsupported koetyyppi.", "INVALID_KOETYYPPI");
    case "invalid_huomautus":
      return badRequest("Unsupported huomautus.", "INVALID_HUOMAUTUS");
    case "invalid_entry_integer":
      return badRequest(
        "Integer fields must be safe integers or null.",
        "INVALID_INTEGER_FIELD",
      );
    case "invalid_entry_number":
      return badRequest(
        "Numeric fields must be finite numbers or null.",
        "INVALID_NUMERIC_FIELD",
      );
    case "invalid_era_integer":
      return badRequest(
        "Era integer fields must be safe integers or null.",
        "INVALID_ERA_INTEGER_FIELD",
      );
    case "invalid_era_number_field":
      return badRequest(
        "Era numeric fields must be finite numbers or null.",
        "INVALID_ERA_NUMERIC_FIELD",
      );
    case "invalid_lisatieto_code":
      return badRequest(
        `Unsupported lisatieto code: ${issue.value ?? ""}`,
        "INVALID_LISATIETO_CODE",
      );
    case "duplicate_lisatieto_key":
      return badRequest(
        "Duplicate lisatieto rows are not allowed.",
        "INVALID_TRIAL_ADDITIONAL_INFO",
      );
    case "invalid_lisatieto_era":
      return badRequest(
        "Lisatiedot era value references unknown era.",
        "INVALID_LISATIETO_ERA",
      );
    case "duplicate_lisatieto_era_value":
      return badRequest(
        "Duplicate lisatieto era values are not allowed.",
        "INVALID_TRIAL_ADDITIONAL_INFO",
      );
    case "invalid_lisatieto_order":
      return badRequest(
        "Lisatieto order must be a safe integer or null.",
        "INVALID_INTEGER_FIELD",
      );
  }
}

function badRequest(
  error: string,
  code: string,
): ServiceResult<UpdateAdminTrialEntryResponse> {
  return { status: 400, body: { ok: false, error, code } };
}

export async function updateAdminTrialEntry(
  input: UpdateAdminTrialEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<UpdateAdminTrialEntryResponse>> {
  const startedAt = Date.now();
  const trialEventId = input.trialEventId.trim();
  const trialEntryId = input.trialEntryId.trim();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.updateAdminTrialEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!trialEventId) {
    return badRequest("Trial event id is required.", "INVALID_TRIAL_EVENT_ID");
  }
  if (!trialEntryId) {
    return badRequest("Trial entry id is required.", "INVALID_TRIAL_ENTRY_ID");
  }

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    return { status: authResult.status, body: authResult.body };
  }

  const parsed = parseAdminTrialEntryWriteInput(input, { mode: "update" });
  if (!parsed.ok) {
    return validationFailure(parsed.issue);
  }

  try {
    const result = await updateAdminTrialEntryWriteDb({
      trialEventId,
      trialEntryId,
      ...parsed.data,
    });
    if (result.status === "not_found") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Entry not found in selected trial event.",
          code: "ENTRY_NOT_FOUND",
        },
      };
    }
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trialEventId: result.trialEventId,
          trialEntryId: result.trialEntryId,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialEventId,
        trialEntryId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial entry update failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
