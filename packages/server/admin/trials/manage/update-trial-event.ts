import type {
  CurrentUserDto,
  UpdateAdminTrialEventRequest,
  UpdateAdminTrialEventResponse,
} from "@beagle/contracts";
import { updateAdminTrialEventWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseAdminTrialEventWriteInput } from "./internal/parse-admin-trial-event-write-input";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

// Validates and updates canonical TrialEvent metadata for one admin-selected event.
export async function updateAdminTrialEvent(
  input: UpdateAdminTrialEventRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<UpdateAdminTrialEventResponse>> {
  const startedAt = Date.now();
  const trialEventId = input.trialEventId.trim();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.updateAdminTrialEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!trialEventId) {
    log.warn(
      { event: "invalid_trial_event_id", durationMs: Date.now() - startedAt },
      "admin trial event update rejected because trialEventId is invalid",
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
      "admin trial event update rejected by authorization",
    );
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const parsed = parseAdminTrialEventWriteInput(input, {
    requireSklKoeId: false,
  });
  if (!parsed.ok) {
    log.warn(
      {
        event: parsed.issue.event,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event update rejected because event metadata is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: parsed.issue.error,
        code: parsed.issue.code,
      },
    };
  }

  const {
    normalizedEventDate,
    eventDate,
    eventPlace,
    jarjestaja,
    ylituomari,
    ylituomariNumero,
    ytKertomus,
    kennelpiiri,
    kennelpiirinro,
    sklKoeId,
  } = parsed.data;

  log.info(
    {
      event: "start",
      trialEventId,
      eventDate: normalizedEventDate,
      eventPlace,
      sklKoeId,
    },
    "admin trial event update started",
  );

  try {
    const result = await updateAdminTrialEventWriteDb({
      trialEventId,
      eventDate,
      eventPlace,
      jarjestaja,
      ylituomari,
      ylituomariNumero,
      ytKertomus,
      kennelpiiri,
      kennelpiirinro,
      sklKoeId,
    });

    if (result.status === "not_found") {
      log.warn(
        {
          event: "not_found",
          trialEventId,
          durationMs: Date.now() - startedAt,
        },
        "admin trial event update failed because event was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial event not found.",
          code: "EVENT_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        trialEventId: result.trialEventId,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event update succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trialEventId: result.trialEventId,
        },
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
      "admin trial event update failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update admin trial event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
