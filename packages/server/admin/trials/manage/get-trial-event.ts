import { getAdminTrialEventDetailsDb } from "@beagle/db";
import type {
  AdminTrialEventDetailsRequest,
  AdminTrialEventDetailsResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function normalizeTrialEventId(value: string): string {
  return value.trim();
}

export async function getAdminTrialEvent(
  input: AdminTrialEventDetailsRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminTrialEventDetailsResponse>> {
  const startedAt = Date.now();
  const normalizedTrialEventId = normalizeTrialEventId(input.trialEventId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.getAdminTrialEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!normalizedTrialEventId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial event id.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    };
  }

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  try {
    const result = await getAdminTrialEventDetailsDb({
      trialEventId: normalizedTrialEventId,
    });

    if (!result) {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial event not found.",
          code: "TRIAL_EVENT_NOT_FOUND",
        },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          event: {
            trialEventId: result.trialEventId,
            eventDate: toBusinessDateOnly(result.eventDate),
            eventPlace: result.eventPlace,
            eventName: result.eventName,
            organizer: result.organizer,
            judge: result.judge,
            sklKoeId: result.sklKoeId,
            dogCount: result.entries.length,
            koemuoto: result.koemuoto,
            entries: result.entries,
          },
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialEventId: normalizedTrialEventId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial event fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial event details.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
