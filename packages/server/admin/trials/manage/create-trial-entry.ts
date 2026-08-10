import type {
  CreateAdminTrialEntryRequest,
  CreateAdminTrialEntryResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { createAdminTrialEntryWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import {
  isValidRegistrationNo,
  normalizeRegistrationNo,
} from "@server/dogs/core";
import { parseAdminTrialEntryWriteInput } from "./internal/parse-admin-trial-entry-write-input";

type ServiceLogContext = { requestId?: string; actorUserId?: string };

const ISSUE_CODES = {
  entry: "INVALID_TRIAL_ENTRY",
  eras: "INVALID_TRIAL_ERAS",
  additional_info: "INVALID_TRIAL_ADDITIONAL_INFO",
} as const;

// Creates one API-compatible manual trial result for an authorized administrator.
export async function createAdminTrialEntry(
  input: CreateAdminTrialEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<CreateAdminTrialEntryResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.createAdminTrialEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });
  const auth = requireAdmin(currentUser);
  if (!auth.body.ok) {
    log.warn(
      { event: "forbidden", status: auth.status },
      "admin trial entry creation rejected by authorization",
    );
    return { status: auth.status, body: auth.body };
  }

  const trialEventId =
    typeof input?.trialEventId === "string" ? input.trialEventId.trim() : "";
  if (!trialEventId) {
    log.warn(
      { event: "invalid_trial_event_id" },
      "admin trial entry creation rejected before persistence",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Trial event id is required.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    };
  }

  const registrationNo = normalizeRegistrationNo(input?.registrationNo);
  if (!registrationNo || !isValidRegistrationNo(registrationNo)) {
    log.warn(
      { event: "invalid_registration_number", trialEventId },
      "admin trial entry creation rejected before persistence",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Registration number is invalid.",
        code: "INVALID_REGISTRATION_NUMBER",
      },
    };
  }

  const parsed = parseAdminTrialEntryWriteInput(input, { mode: "create" });
  if (!parsed.ok) {
    log.warn(
      { event: parsed.issue.reason, trialEventId, registrationNo },
      "admin trial entry creation rejected before persistence",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Trial result fields are invalid.",
        code: ISSUE_CODES[parsed.issue.area],
        details: parsed.issue,
      },
    };
  }

  log.info(
    { event: "start", trialEventId, registrationNo },
    "admin trial entry creation started",
  );
  try {
    const result = await createAdminTrialEntryWriteDb({
      trialEventId,
      canonicalRegistrationNo: registrationNo,
      ...parsed.data,
    });
    if (result.status === "event_not_found") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial event was not found.",
          code: "TRIAL_EVENT_NOT_FOUND",
        },
      };
    }
    if (result.status === "event_missing_skl_id") {
      return {
        status: 409,
        body: {
          ok: false,
          error: "Trial event is missing its SKL id.",
          code: "TRIAL_EVENT_MISSING_SKL_ID",
        },
      };
    }
    if (result.status === "registration_conflict") {
      return {
        status: 409,
        body: {
          ok: false,
          error: "Registration already exists in this event.",
          code: "TRIAL_ENTRY_REGISTRATION_CONFLICT",
        },
      };
    }
    log.info(
      {
        event: "success",
        trialEventId,
        trialEntryId: result.trialEntryId,
        registrationNo,
        durationMs: Date.now() - startedAt,
      },
      "admin trial entry creation succeeded",
    );
    return {
      status: 201,
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
        registrationNo,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial entry creation failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to create admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
