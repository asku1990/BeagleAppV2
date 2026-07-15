// Builds the public dog profile DTO by combining base dog profile data with
// show/trial domain fetches and shared legacy result normalization helpers.
import {
  getBeagleDogProfileDb,
  loadDogPedigreeAncestryDb,
  getBeagleShowsForDogDb,
  getBeagleTrialsForDogDb,
  type BeagleDogProfileDb,
  type BeagleShowDogRowDb,
  type BeagleTrialDogRowDb,
} from "@beagle/db";
import type {
  BeagleDogProfileDto,
  BeagleDogProfileParentDto,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import {
  calculateInbreedingCoefficientPct,
  getInbreedingAncestryLoadDepth,
  parseDogId,
} from "@server/dogs/core";
import { encodeShowId } from "@server/shows/internal/show-id";
import { formatTrialAward } from "@server/trials/core";
import { canRenderTrialDogPdf } from "@server/trials/pdf";

export type DogsServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function toPublicParent(
  parent: BeagleDogProfileDb["sire"],
): BeagleDogProfileParentDto | null {
  if (!parent) {
    return null;
  }

  return { ...parent, status: parent.status ?? "NORMAL" };
}

function mapDogProfileFromDb(
  profile: BeagleDogProfileDb,
  shows: BeagleShowDogRowDb[],
  trials: BeagleTrialDogRowDb[],
  inbreedingCoefficientPct: number | null,
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
    inbreedingCoefficientPct,
    sire: toPublicParent(profile.sire),
    dam: toPublicParent(profile.dam),
    pedigree: profile.pedigree.map((generation) => ({
      ...generation,
      cards: generation.cards.map((card) => ({
        ...card,
        sire: toPublicParent(card.sire),
        dam: toPublicParent(card.dam),
      })),
    })),
    offspringSummary: profile.offspringSummary,
    litters: profile.litters.map((litter) => ({
      id: litter.id,
      birthDate: litter.birthDate ? toBusinessDateOnly(litter.birthDate) : null,
      otherParent: toPublicParent(litter.otherParent),
      puppyCount: litter.puppyCount,
      puppies: litter.puppies,
    })),
    siblingsSummary: profile.siblingsSummary,
    siblings: profile.siblings,
    titles: (profile.titles ?? []).map((title) => ({
      awardedOn: title.awardedOn ? toBusinessDateOnly(title.awardedOn) : null,
      titleCode: title.titleCode,
      titleName: title.titleName,
    })),
    shows: shows.map((show) => {
      const showDate = toBusinessDateOnly(show.date);
      return {
        id: show.id,
        showId: encodeShowId(showDate, show.place, show.eventKey),
        place: show.place,
        date: showDate,
        showType: show.showType,
        classCode: show.classCode,
        qualityGrade: show.qualityGrade,
        classPlacement: show.classPlacement,
        pupn: show.pupn,
        awards: show.awards,
        critiqueText: show.critiqueText,
        judge: show.judge,
        heightCm: show.heightCm,
      };
    }),
    trials: trials.map((trial) => ({
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
    })),
  };
}

async function calculateProfileInbreedingCoefficientPct(
  profile: BeagleDogProfileDb,
  parsedDogId: string,
): Promise<number | null> {
  if (!profile.sire || !profile.dam) {
    return null;
  }

  const ancestry = await loadDogPedigreeAncestryDb(
    parsedDogId,
    getInbreedingAncestryLoadDepth(9),
  );

  return calculateInbreedingCoefficientPct(parsedDogId, ancestry, 9);
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

    const [inbreedingCoefficientPct, shows, trials] = await Promise.all([
      calculateProfileInbreedingCoefficientPct(profile, parsedDogId),
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
      body: {
        ok: true,
        data: mapDogProfileFromDb(
          profile,
          shows,
          trials,
          inbreedingCoefficientPct,
        ),
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
      "dog profile fetch failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load dog profile." },
    };
  }
}
