// Builds the public dog trials DTO without loading the full profile graph.
import type {
  BeagleDogProfileTrialRowDto,
  BeagleDogTrialsEraStatsDto,
  BeagleDogTrialsDto,
  BeagleDogTrialsSummaryDto,
} from "@beagle/contracts";
import {
  getBeagleDogProfileIdentityDb,
  getBeagleTrialSummarySourceForDogDb,
  getBeagleTrialsForDogDb,
} from "@beagle/db";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseDogId } from "@server/dogs/core";
import { formatTrialAward } from "@server/trials/core";
import { canRenderTrialDogPdf } from "@server/trials/pdf";
import { buildBeagleDogTrialsSummary } from "./internal/beagle-dog-trials-summary";

function emptyTrialsSummary(): BeagleDogTrialsSummaryDto {
  return {
    allTrials: [],
    drivenTrials: [],
    noPrize: [],
    prizePlacements: [],
    interrupted: [],
  };
}

function roundTo(value: number, decimals: number): number {
  const multiplier = 10 ** decimals;
  return Math.round(value * multiplier) / multiplier;
}

function buildEraStats(
  trials: Array<Pick<BeagleDogProfileTrialRowDto, "eras">>,
): BeagleDogTrialsEraStatsDto | null {
  const eras = trials.flatMap((trial) => trial.eras ?? []);
  if (eras.length === 0) {
    return null;
  }

  const drivenEras = eras.filter((era) => era.ajomin != null);
  const drivenEraCount = drivenEras.length;
  const driveMinuteSum = drivenEras.reduce(
    (sum, era) => sum + (era.ajomin ?? 0),
    0,
  );

  return {
    trialCount: trials.length,
    trialCountWithEras: trials.filter((trial) => (trial.eras?.length ?? 0) > 0)
      .length,
    eraCount: eras.length,
    drivenEraCount,
    drivenEraPercentage: roundTo((drivenEraCount / eras.length) * 100, 1),
    averageDriveMinutes:
      drivenEraCount === 0 ? 0 : roundTo(driveMinuteSum / drivenEraCount, 2),
  };
}

export async function getBeagleDogTrialsService(
  dogId: string,
  context?: { requestId?: string; actorUserId?: string },
): Promise<ServiceResult<BeagleDogTrialsDto>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "dogs.getBeagleDogTrials",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });
  const parsedDogId = parseDogId(dogId);
  log.info(
    { event: "start", dogId: parsedDogId ?? dogId },
    "dog trials fetch started",
  );

  if (!parsedDogId) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "dog trials fetch rejected: invalid dogId",
    );
    return {
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    };
  }

  try {
    const identity = await getBeagleDogProfileIdentityDb(parsedDogId);
    if (!identity) {
      log.info(
        {
          event: "not_found",
          dogId: parsedDogId,
          durationMs: Date.now() - startedAt,
        },
        "dog trials not found",
      );
      return {
        status: 404,
        body: { ok: false, error: "Dog profile not found." },
      };
    }

    const trials = await getBeagleTrialsForDogDb(parsedDogId, {
      includeEras: true,
    });
    const summary =
      trials.length === 0
        ? emptyTrialsSummary()
        : buildBeagleDogTrialsSummary({
            dogName: identity.name,
            ...(await getBeagleTrialSummarySourceForDogDb(parsedDogId)),
          });

    log.info(
      {
        event: "success",
        dogId: parsedDogId,
        trialCount: trials.length,
        durationMs: Date.now() - startedAt,
      },
      "dog trials fetch succeeded",
    );

    const trialDtos: BeagleDogProfileTrialRowDto[] = trials.map((trial) => ({
      id: trial.id,
      trialEntryId: trial.id,
      trialId: trial.trialEventId,
      trialRuleWindowId: trial.trialRuleWindowId,
      hasDogTrialPdf: canRenderTrialDogPdf(trial.trialRuleWindowId),
      place: trial.place,
      date: toBusinessDateOnly(trial.date),
      weather: trial.weather,
      koetyyppi: trial.koetyyppi,
      koiriaLuokassa: trial.koiriaLuokassa,
      rank: trial.rank,
      points: trial.points,
      award: formatTrialAward(trial.award, trial.classCode),
      judge: trial.judge,
      haku: trial.haku,
      hauk: trial.hauk,
      yva: trial.yva,
      hlo: trial.hlo,
      alo: trial.alo,
      tja: trial.tja,
      pin: trial.pin,
      eras: trial.eras?.map((era) => ({
        era: era.era,
        alkoi: era.alkoi,
        hakumin: era.hakumin,
        ajomin: era.ajomin,
        haku: era.haku,
        hauk: era.hauk,
        yva: era.yva,
        hlo: era.hlo,
        alo: era.alo,
        tja: era.tja,
        pin: era.pin,
        huomautusTeksti: era.huomautusTeksti,
      })),
    }));

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          id: identity.id,
          name: identity.name,
          registrationNo: identity.registrationNo,
          trials: trialDtos,
          summary,
          eraStats: buildEraStats(trialDtos),
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "dog trials fetch failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load dog trials." },
    };
  }
}
