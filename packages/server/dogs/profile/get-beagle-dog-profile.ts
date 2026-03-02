import { getBeagleDogProfileDb, type BeagleDogProfileDb } from "@beagle/db";
import type { BeagleDogProfileDto } from "@beagle/contracts";
import { normalizeShowResult } from "../show-results";
import { formatTrialAward } from "../trial-results";
import { toBusinessDateOnly } from "../../shared/date-only";
import { toErrorLog, withLogContext } from "../../shared/logger";
import type { ServiceResult } from "../../shared/result";

export type DogsServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function mapDogProfileFromDb(profile: BeagleDogProfileDb): BeagleDogProfileDto {
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
    shows: profile.shows.map((show) => ({
      id: show.id,
      place: show.place,
      date: toBusinessDateOnly(show.date),
      result: normalizeShowResult(show.result, toBusinessDateOnly(show.date)),
      judge: show.judge,
      heightCm: show.heightCm,
    })),
    trials: profile.trials.map((trial) => ({
      id: trial.id,
      place: trial.place,
      date: toBusinessDateOnly(trial.date),
      weather: trial.weather,
      className: trial.className,
      rank: trial.rank,
      points: trial.points,
      award: formatTrialAward(trial.award, trial.classCode),
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
  log.info({ event: "start", dogId }, "dog profile fetch started");

  if (!dogId) {
    log.warn(
      { event: "invalid_input", durationMs: Date.now() - startedAt },
      "dog profile fetch rejected: missing dogId",
    );
    return {
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    };
  }

  try {
    const data = await getBeagleDogProfileDb(dogId);
    if (!data) {
      log.info(
        { event: "not_found", dogId, durationMs: Date.now() - startedAt },
        "dog profile not found",
      );
      return {
        status: 404,
        body: { ok: false, error: "Dog profile not found." },
      };
    }

    log.info(
      { event: "success", dogId, durationMs: Date.now() - startedAt },
      "dog profile fetch succeeded",
    );
    return {
      status: 200,
      body: { ok: true, data: mapDogProfileFromDb(data) },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId,
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
