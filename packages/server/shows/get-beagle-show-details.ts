import { getBeagleShowDetailsDb } from "@beagle/db";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import { toBusinessDateOnly } from "../core/date-only";
import { toErrorLog, withLogContext } from "../core/logger";
import type { ServiceResult } from "../core/result";
import { encodeShowId, parseShowId } from "./internal/show-id";
import type { ShowsServiceLogContext } from "./types";

export async function getBeagleShowDetailsService(
  showId: string,
  context?: ShowsServiceLogContext,
): Promise<ServiceResult<BeagleShowDetailsResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "shows.getBeagleShowDetails",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const parsedShowId = parseShowId(showId);
  if (!parsedShowId) {
    log.warn(
      { event: "invalid_show_id", durationMs: Date.now() - startedAt },
      "show detail rejected because showId is invalid",
    );
    return {
      status: 400,
      body: { ok: false, error: "Invalid show id." },
    };
  }

  log.info(
    {
      event: "start",
      eventDate: parsedShowId.eventDateIsoDate,
      eventPlace: parsedShowId.eventPlace,
    },
    "show detail fetch started",
  );

  try {
    const result = await getBeagleShowDetailsDb({
      eventKey: parsedShowId.eventKey,
      eventDate: parsedShowId.eventDate,
      eventPlace: parsedShowId.eventPlace,
    });
    if (!result) {
      log.info(
        {
          event: "not_found",
          eventDate: parsedShowId.eventDateIsoDate,
          eventPlace: parsedShowId.eventPlace,
          durationMs: Date.now() - startedAt,
        },
        "show detail not found",
      );
      return {
        status: 404,
        body: { ok: false, error: "Show not found." },
      };
    }

    const eventDate = toBusinessDateOnly(result.eventDate);
    const data: BeagleShowDetailsResponse = {
      show: {
        showId: encodeShowId(eventDate, result.eventPlace, result.eventKey),
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
        showType: item.showType,
        classCode: item.classCode,
        qualityGrade: item.qualityGrade,
        classPlacement: item.classPlacement,
        pupn: item.pupn,
        awards: item.awards,
        critiqueText: item.critiqueText,
        heightCm: item.heightCm,
        judge: item.judge,
      })),
    };

    log.info(
      {
        event: "success",
        eventDate,
        eventPlace: data.show.eventPlace,
        dogCount: data.show.dogCount,
        durationMs: Date.now() - startedAt,
      },
      "show detail fetch succeeded",
    );

    return {
      status: 200,
      body: { ok: true, data },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        eventDate: parsedShowId.eventDateIsoDate,
        eventPlace: parsedShowId.eventPlace,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "show detail fetch failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load show details." },
    };
  }
}
