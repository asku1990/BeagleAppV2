import { getAdminTrialDetailsDb } from "@beagle/db";
import type {
  AdminTrialDetailsRequest,
  AdminTrialDetailsResponse,
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

function normalizeTrialId(value: string): string {
  return value.trim();
}

export async function getAdminTrial(
  input: AdminTrialDetailsRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminTrialDetailsResponse>> {
  const startedAt = Date.now();
  const normalizedTrialId = normalizeTrialId(input.trialId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.getAdminTrial",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!normalizedTrialId) {
    log.warn(
      {
        event: "invalid_trial_id",
        durationMs: Date.now() - startedAt,
      },
      "admin trial detail rejected because trialId is invalid",
    );

    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial id.",
        code: "INVALID_TRIAL_ID",
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
      "admin trial detail rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  log.info(
    {
      event: "start",
      trialId: normalizedTrialId,
    },
    "admin trial detail fetch started",
  );

  try {
    const result = await getAdminTrialDetailsDb({
      trialId: normalizedTrialId,
    });

    if (!result) {
      log.info(
        {
          event: "not_found",
          trialId: normalizedTrialId,
          durationMs: Date.now() - startedAt,
        },
        "admin trial detail not found",
      );

      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial not found.",
          code: "TRIAL_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        trialId: normalizedTrialId,
        durationMs: Date.now() - startedAt,
      },
      "admin trial detail fetch succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trial: {
            trialId: result.trialId,
            dogId: result.dogId,
            dogName: result.dogName,
            registrationNo: result.registrationNo,
            sklKoeId: result.sklKoeId,
            entryKey: result.entryKey,
            eventDate: toBusinessDateOnly(result.eventDate),
            eventName: result.eventName,
            eventPlace: result.eventPlace,
            kennelDistrict: result.kennelDistrict,
            kennelDistrictNo: result.kennelDistrictNo,
            keli: result.keli,
            paljasMaa: result.paljasMaa,
            lumikeli: result.lumikeli,
            luokka: result.luokka,
            palkinto: result.palkinto,
            loppupisteet: result.loppupisteet,
            sijoitus: result.sijoitus,
            hakuKeskiarvo: result.hakuKeskiarvo,
            haukkuKeskiarvo: result.haukkuKeskiarvo,
            yleisvaikutelmaPisteet: result.yleisvaikutelmaPisteet,
            hakuloysyysTappioYhteensa: result.hakuloysyysTappioYhteensa,
            ajoloysyysTappioYhteensa: result.ajoloysyysTappioYhteensa,
            tieJaEstetyoskentelyPisteet: result.tieJaEstetyoskentelyPisteet,
            metsastysintoPisteet: result.metsastysintoPisteet,
            ylituomariNimi: result.ylituomariNimi,
            rokotusOk: result.rokotusOk,
            tunnistusOk: result.tunnistusOk,
            notes: result.notes,
            rawPayloadJson: null,
            rawPayloadAvailable: false,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          },
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialId: normalizedTrialId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial detail fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial details.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
