import type {
  CurrentUserDto,
  UpdateAdminTrialEventRequest,
  UpdateAdminTrialEventResponse,
} from "@beagle/contracts";
import { updateAdminTrialEventWriteDb } from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseIsoDateOnlyToUtcDate } from "@server/trials/internal/iso-date";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

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

  const normalizedEventDate = input.eventDate.trim();
  const eventDate = parseIsoDateOnlyToUtcDate(normalizedEventDate);
  if (!eventDate) {
    log.warn(
      {
        event: "invalid_event_date",
        eventDate: input.eventDate,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event update rejected because eventDate is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Event date must use YYYY-MM-DD format.",
        code: "INVALID_EVENT_DATE",
      },
    };
  }

  const eventPlace = normalizeRequiredText(input.eventPlace);
  if (!eventPlace) {
    log.warn(
      { event: "invalid_event_place", durationMs: Date.now() - startedAt },
      "admin trial event update rejected because eventPlace is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Event place is required.",
        code: "INVALID_EVENT_PLACE",
      },
    };
  }

  const organizer = normalizeOptionalText(input.organizer);
  const judge = normalizeOptionalText(input.judge);

  const sklKoeId = input.sklKoeId;
  if (
    sklKoeId !== null &&
    (!Number.isInteger(sklKoeId) || !Number.isFinite(sklKoeId) || sklKoeId < 1)
  ) {
    log.warn(
      {
        event: "invalid_skl_koe_id",
        sklKoeId: input.sklKoeId,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event update rejected because sklKoeId is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "SKL koe id must be a positive integer.",
        code: "INVALID_SKL_KOE_ID",
      },
    };
  }

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
      organizer,
      judge,
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
