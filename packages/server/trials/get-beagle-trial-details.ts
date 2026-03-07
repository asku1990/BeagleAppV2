import { getBeagleTrialDetailsDb } from "@beagle/db";
import type { BeagleTrialDetailsResponse } from "@beagle/contracts";
import { toBusinessDateOnly } from "../core/date-only";
import { toErrorLog, withLogContext } from "../core/logger";
import type { ServiceResult } from "../core/result";
import { formatTrialAward } from "./core";
import { encodeTrialId, parseTrialId } from "./internal/trial-id";
import type { TrialsServiceLogContext } from "./types";

export async function getBeagleTrialDetailsService(
  trialId: string,
  context?: TrialsServiceLogContext,
): Promise<ServiceResult<BeagleTrialDetailsResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "trials.getBeagleTrialDetails",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const parsedTrialId = parseTrialId(trialId);
  if (!parsedTrialId) {
    log.warn(
      { event: "invalid_trial_id", durationMs: Date.now() - startedAt },
      "trial detail rejected because trialId is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid trial id." },
    };
  }

  log.info(
    {
      event: "start",
      eventDate: parsedTrialId.eventDateIsoDate,
      eventPlace: parsedTrialId.eventPlace,
    },
    "trial detail fetch started",
  );

  try {
    const result = await getBeagleTrialDetailsDb({
      eventDate: parsedTrialId.eventDate,
      eventPlace: parsedTrialId.eventPlace,
    });
    if (!result) {
      log.info(
        {
          event: "not_found",
          eventDate: parsedTrialId.eventDateIsoDate,
          eventPlace: parsedTrialId.eventPlace,
          durationMs: Date.now() - startedAt,
        },
        "trial detail not found",
      );
      return {
        status: 404,
        body: { ok: false, error: "Trial not found." },
      };
    }

    const eventDate = toBusinessDateOnly(result.eventDate);
    const data: BeagleTrialDetailsResponse = {
      trial: {
        trialId: encodeTrialId(eventDate, result.eventPlace),
        eventDate,
        eventPlace: result.eventPlace,
        judge: result.judge,
        dogCount: result.dogCount,
      },
      items: result.items.map((item) => ({
        id: item.id,
        dogId: item.dogId,
        registrationNo: item.registrationNo,
        name: item.name,
        sex: item.sex,
        weather: item.weather,
        award: formatTrialAward(item.award, item.classCode),
        classCode: item.classCode,
        rank: item.rank,
        points: item.points,
        judge: item.judge,
        haku: item.haku,
        hauk: item.hauk,
        yva: item.yva,
        hlo: item.hlo,
        alo: item.alo,
        tja: item.tja,
        pin: item.pin,
      })),
    };

    log.info(
      {
        event: "success",
        eventDate,
        eventPlace: data.trial.eventPlace,
        dogCount: data.trial.dogCount,
        durationMs: Date.now() - startedAt,
      },
      "trial detail fetch succeeded",
    );

    return {
      status: 200,
      body: { ok: true, data },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        eventDate: parsedTrialId.eventDateIsoDate,
        eventPlace: parsedTrialId.eventPlace,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "trial detail fetch failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load trial details." },
    };
  }
}
