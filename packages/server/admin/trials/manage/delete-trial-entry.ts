import type {
  CurrentUserDto,
  DeleteAdminTrialEntryRequest,
  DeleteAdminTrialEntryResponse,
} from "@beagle/contracts";
import { deleteAdminTrialEntryWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

// Validates and deletes one admin trial entry scoped to a selected trial event.
export async function deleteAdminTrialEntry(
  input: DeleteAdminTrialEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<DeleteAdminTrialEntryResponse>> {
  const startedAt = Date.now();
  const trialEventId = input.trialEventId.trim();
  const trialEntryId = input.trialEntryId.trim();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.deleteAdminTrialEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!trialEventId) {
    log.warn(
      { event: "invalid_trial_event_id", durationMs: Date.now() - startedAt },
      "admin trial entry delete rejected because trialEventId is invalid",
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

  if (!trialEntryId) {
    log.warn(
      { event: "invalid_trial_entry_id", durationMs: Date.now() - startedAt },
      "admin trial entry delete rejected because trialEntryId is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Trial entry id is required.",
        code: "INVALID_TRIAL_ENTRY_ID",
      },
    };
  }

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trial entry delete rejected by authorization",
    );
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  log.info(
    {
      event: "start",
      trialEventId,
      trialEntryId,
    },
    "admin trial entry delete started",
  );

  try {
    const result = await deleteAdminTrialEntryWriteDb({
      trialEventId,
      trialEntryId,
    });

    if (result.status === "not_found") {
      log.warn(
        {
          event: "not_found",
          trialEventId,
          trialEntryId,
          durationMs: Date.now() - startedAt,
        },
        "admin trial entry delete failed because entry was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Entry not found in selected trial event.",
          code: "ENTRY_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        trialEventId: result.trialEventId,
        trialEntryId: result.deletedTrialEntryId,
        deletedTrialEvent: result.deletedTrialEvent,
        durationMs: Date.now() - startedAt,
      },
      "admin trial entry delete succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          deletedTrialEntryId: result.deletedTrialEntryId,
          trialEventId: result.trialEventId,
          deletedTrialEvent: result.deletedTrialEvent,
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
      "admin trial entry delete failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
