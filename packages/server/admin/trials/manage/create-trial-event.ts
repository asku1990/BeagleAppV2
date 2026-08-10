import type {
  CreateAdminTrialEventRequest,
  CreateAdminTrialEventResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import {
  createAdminTrialEventWriteDb,
  listActiveTrialRuleWindowsDb,
} from "@beagle/db";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { resolveTrialRuleWindowId } from "@server/trials/core";
import { parseAdminTrialEventWriteInput } from "./internal/parse-admin-trial-event-write-input";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002",
  );
}

// Creates one empty canonical trial event for an authorized administrator.
export async function createAdminTrialEvent(
  input: CreateAdminTrialEventRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<CreateAdminTrialEventResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.createAdminTrialEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event creation rejected by authorization",
    );
    return { status: authResult.status, body: authResult.body };
  }

  const parsed = parseAdminTrialEventWriteInput(input, {
    requireSklKoeId: true,
  });
  if (!parsed.ok) {
    log.warn(
      { event: parsed.issue.event, durationMs: Date.now() - startedAt },
      "admin trial event creation rejected because event metadata is invalid",
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

  const event = parsed.data;
  log.info(
    {
      event: "start",
      eventDate: event.normalizedEventDate,
      eventPlace: event.eventPlace,
      sklKoeId: event.sklKoeId,
    },
    "admin trial event creation started",
  );

  try {
    const activeRuleWindows = await listActiveTrialRuleWindowsDb();
    const trialRuleWindowId = resolveTrialRuleWindowId(
      activeRuleWindows,
      event.eventDate,
    );
    const result = await createAdminTrialEventWriteDb({
      eventDate: event.eventDate,
      eventPlace: event.eventPlace,
      jarjestaja: event.jarjestaja,
      ylituomari: event.ylituomari,
      ylituomariNumero: event.ylituomariNumero,
      ytKertomus: event.ytKertomus,
      kennelpiiri: event.kennelpiiri,
      kennelpiirinro: event.kennelpiirinro,
      sklKoeId: event.sklKoeId!,
      trialRuleWindowId,
    });

    log.info(
      {
        event: "success",
        trialEventId: result.trialEventId,
        sklKoeId: event.sklKoeId,
        durationMs: Date.now() - startedAt,
      },
      "admin trial event creation succeeded",
    );
    return {
      status: 201,
      body: { ok: true, data: { trialEventId: result.trialEventId } },
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      log.warn(
        {
          event: "skl_koe_id_conflict",
          sklKoeId: event.sklKoeId,
          durationMs: Date.now() - startedAt,
        },
        "admin trial event creation rejected because sklKoeId is already used",
      );
      return {
        status: 409,
        body: {
          ok: false,
          error: "An event already uses this SKL koe id.",
          code: "SKL_KOE_ID_CONFLICT",
        },
      };
    }

    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial event creation failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to create admin trial event.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
