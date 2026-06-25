// Builds the public dog trials DTO without loading the full profile graph.
import { getBeagleDogTrialsDb } from "@beagle/db";
import type { BeagleDogTrialsDto } from "@beagle/contracts";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseDogId } from "@server/dogs/core";
import { formatTrialAward } from "@server/trials/core";

function toNumberOrNull(value: { toNumber(): number } | null): number | null {
  return value === null ? null : value.toNumber();
}

function mapTrials(
  result: NonNullable<Awaited<ReturnType<typeof getBeagleDogTrialsDb>>>,
): BeagleDogTrialsDto {
  return {
    id: result.id,
    name: result.name,
    registrationNo: result.registrationNo,
    trials: result.trials.map((trial) => ({
      id: trial.id,
      trialId: trial.trialId,
      place: trial.place,
      date: toBusinessDateOnly(trial.date),
      weather: trial.weather,
      koetyyppi: trial.koetyyppi,
      koiriaLuokassa: trial.koiriaLuokassa,
      rank: trial.rank,
      points: toNumberOrNull(trial.points),
      award: formatTrialAward(trial.pa, trial.lk),
      judge: trial.tuom1?.trim() || trial.ylituomariNimi || null,
      haku: toNumberOrNull(trial.haku),
      hauk: toNumberOrNull(trial.hauk),
      yva: toNumberOrNull(trial.yva),
      hlo: toNumberOrNull(trial.hlo),
      alo: toNumberOrNull(trial.alo),
      tja: toNumberOrNull(trial.tja),
      pin: toNumberOrNull(trial.pin),
    })),
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
    const result = await getBeagleDogTrialsDb(parsedDogId);
    if (!result) {
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

    log.info(
      {
        event: "success",
        dogId: parsedDogId,
        trialCount: result.trials.length,
        durationMs: Date.now() - startedAt,
      },
      "dog trials fetch succeeded",
    );

    const data = mapTrials(result);
    return {
      status: 200,
      body: {
        ok: true,
        data,
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
