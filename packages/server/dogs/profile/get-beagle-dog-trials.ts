// Builds the public dog trials DTO without loading the full profile graph.
import type { BeagleDogTrialsDto } from "@beagle/contracts";
import { getBeagleDogProfileDb, getBeagleTrialsForDogDb } from "@beagle/db";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseDogId } from "@server/dogs/core";
import { formatTrialAward } from "@server/trials/core";

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
    const [profile, trials] = await Promise.all([
      getBeagleDogProfileDb(parsedDogId),
      getBeagleTrialsForDogDb(parsedDogId),
    ]);

    if (!profile) {
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
        trialCount: trials.length,
        durationMs: Date.now() - startedAt,
      },
      "dog trials fetch succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          id: profile.id,
          name: profile.name,
          registrationNo: profile.registrationNo,
          trials: trials.map((trial) => ({
            id: trial.id,
            trialId: trial.trialEventId,
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
          })),
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
