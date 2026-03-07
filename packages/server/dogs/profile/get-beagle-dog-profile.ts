// Builds the public dog profile DTO by combining base dog profile data with
// show/trial domain fetches and shared legacy result normalization helpers.
import {
  getBeagleDogProfileDb,
  getBeagleShowsForDogDb,
  getBeagleTrialsForDogDb,
  type BeagleDogProfileDb,
  type BeagleShowDogRowDb,
  type BeagleTrialDogRowDb,
} from "@beagle/db";
import type { BeagleDogProfileDto } from "@beagle/contracts";
import { normalizeShowResult } from "../../shows/core";
import { formatTrialAward } from "../../trials/core";
import { toBusinessDateOnly } from "../../core/date-only";
import { toErrorLog, withLogContext } from "../../core/logger";
import type { ServiceResult } from "../../core/result";
import { parseDogId } from "../core";

export type DogsServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function mapDogProfileFromDb(
  profile: BeagleDogProfileDb,
  shows: BeagleShowDogRowDb[],
  trials: BeagleTrialDogRowDb[],
): BeagleDogProfileDto {
  return {
    id: profile.id,
    name: profile.name,
    title: profile.title,
    registrationNo: profile.registrationNo,
    registrationNos: profile.registrationNos,
    birthDate: profile.birthDate ? toBusinessDateOnly(profile.birthDate) : null,
    sex: profile.sex,
    color: profile.color,
    ekNo: profile.ekNo,
    inbreedingCoefficientPct: profile.inbreedingCoefficientPct,
    sire: profile.sire,
    dam: profile.dam,
    pedigree: profile.pedigree,
    shows: shows.map((show) => {
      const showDate = toBusinessDateOnly(show.date);
      return {
        id: show.id,
        place: show.place,
        date: showDate,
        result: normalizeShowResult(show.result, showDate),
        judge: show.judge,
        heightCm: show.heightCm,
      };
    }),
    trials: trials.map((trial) => ({
      id: trial.id,
      place: trial.place,
      date: toBusinessDateOnly(trial.date),
      weather: trial.weather,
      className: trial.className,
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
  };
}

export async function getBeagleDogProfileService(
  dogId: string,
  context?: DogsServiceLogContext,
): Promise<ServiceResult<BeagleDogProfileDto>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "dogs.getBeagleDogProfile",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });
  const parsedDogId = parseDogId(dogId);
  log.info(
    { event: "start", dogId: parsedDogId ?? dogId },
    "dog profile fetch started",
  );

  if (!parsedDogId) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "dog profile fetch rejected: invalid dogId",
    );
    return {
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    };
  }

  try {
    const profile = await getBeagleDogProfileDb(parsedDogId);
    if (!profile) {
      log.info(
        {
          event: "not_found",
          dogId: parsedDogId,
          durationMs: Date.now() - startedAt,
        },
        "dog profile not found",
      );
      return {
        status: 404,
        body: { ok: false, error: "Dog profile not found." },
      };
    }

    const [shows, trials] = await Promise.all([
      getBeagleShowsForDogDb(parsedDogId),
      getBeagleTrialsForDogDb(parsedDogId),
    ]);

    log.info(
      {
        event: "success",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
      },
      "dog profile fetch succeeded",
    );
    return {
      status: 200,
      body: { ok: true, data: mapDogProfileFromDb(profile, shows, trials) },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "dog profile fetch failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load dog profile." },
    };
  }
}
