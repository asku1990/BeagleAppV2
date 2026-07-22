import type {
  CurrentUserDto,
  DeleteAdminTrialEventRequest,
  DeleteAdminTrialEventResponse,
} from "@beagle/contracts";
import { deleteAdminTrialEventWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

// Deletes one canonical trial event only while it has no result rows.
export async function deleteAdminTrialEvent(
  input: DeleteAdminTrialEventRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<DeleteAdminTrialEventResponse>> {
  const startedAt = Date.now();
  const trialEventId = input.trialEventId.trim();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.deleteAdminTrialEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!trialEventId) {
    log.warn(
      { event: "invalid_trial_event_id", durationMs: Date.now() - startedAt },
      "admin trial event deletion rejected because trialEventId is invalid",
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

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event deletion rejected by authorization",
    );
    return { status: authResult.status, body: authResult.body };
  }

  log.info(
    { event: "start", trialEventId },
    "admin trial event deletion started",
  );
  try {
    const result = await deleteAdminTrialEventWriteDb({ trialEventId });
    if (result.status === "not_found") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial event not found.",
          code: "TRIAL_EVENT_NOT_FOUND",
        },
      };
    }
    if (result.status === "not_empty") {
      log.warn(
        {
          event: "not_empty",
          trialEventId,
          durationMs: Date.now() - startedAt,
        },
        "admin trial event deletion rejected because the event has entries",
      );
      return {
        status: 409,
        body: {
          ok: false,
          error: "A trial event with results cannot be deleted.",
          code: "TRIAL_EVENT_NOT_EMPTY",
        },
      };
    }

    log.info(
      { event: "success", trialEventId, durationMs: Date.now() - startedAt },
      "admin trial event deletion succeeded",
    );
    return {
      status: 200,
      body: {
        ok: true,
        data: { deletedTrialEventId: result.deletedTrialEventId },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialEventId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial event deletion failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin trial event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
