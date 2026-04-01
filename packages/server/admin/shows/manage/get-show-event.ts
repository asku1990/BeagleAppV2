import {
  type AdminShowDetailsRequest,
  type AdminShowDetailsResponse,
  type CurrentUserDto,
} from "@beagle/contracts";
import { getAdminShowEventDetailsDb } from "@beagle/db";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";
import { encodeShowId, parseShowId } from "@server/shows/internal/show-id";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function toEventDateIso(value: Date): string {
  return toBusinessDateOnly(value);
}

function formatHeight(value: number | null): string {
  return value == null ? "" : String(value);
}

function formatPlacement(value: number | null): string {
  return value == null ? "" : String(value);
}

export async function getAdminShowEvent(
  input: AdminShowDetailsRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminShowDetailsResponse>> {
  const startedAt = Date.now();
  const parsedShowId = parseShowId(input.showId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-shows.getAdminShowEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!parsedShowId) {
    log.warn(
      {
        event: "invalid_show_id",
        durationMs: Date.now() - startedAt,
      },
      "admin show detail rejected because showId is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid show id.",
        code: "INVALID_SHOW_ID",
      },
    };
  }

  log.info(
    {
      event: "start",
      eventDate: parsedShowId.eventDateIsoDate,
      eventPlace: parsedShowId.eventPlace,
      eventKey: parsedShowId.eventKey,
    },
    "admin show detail fetch started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin show detail rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  try {
    const result = await getAdminShowEventDetailsDb({
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
        "admin show detail not found",
      );

      return {
        status: 404,
        body: {
          ok: false,
          error: "Show not found.",
          code: "SHOW_NOT_FOUND",
        },
      };
    }

    const eventDate = toEventDateIso(result.eventDate);
    const data: AdminShowDetailsResponse = {
      show: {
        showId: encodeShowId(eventDate, result.eventPlace, result.eventKey),
        eventDate,
        eventPlace: result.eventPlace,
        eventCity: result.eventCity ?? "",
        eventName: result.eventName ?? "",
        eventType: result.eventType ?? "",
        organizer: result.organizer ?? "",
        judge: result.judge ?? "",
        dogCount: result.dogCount,
        entries: result.items.map((item) => ({
          id: item.id,
          registrationNo: item.registrationNo,
          dogName: item.dogName,
          judge: item.judge ?? "",
          critiqueText: item.critiqueText ?? "",
          heightCm: formatHeight(item.heightCm),
          classCode: item.classCode ?? "",
          qualityGrade: item.qualityGrade ?? "",
          classPlacement: formatPlacement(item.classPlacement),
          pupn: item.pupn ?? "",
          awards: item.awards,
        })),
      },
      options: {
        classOptions: result.options.classOptions,
        qualityOptions: result.options.qualityOptions,
        awardOptions: result.options.awardOptions,
        pupnOptions: result.options.pupnOptions,
      },
    };

    log.info(
      {
        event: "success",
        eventDate,
        eventPlace: data.show.eventPlace,
        dogCount: data.show.dogCount,
        durationMs: Date.now() - startedAt,
      },
      "admin show detail fetch succeeded",
    );

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
        eventDate: parsedShowId.eventDateIsoDate,
        eventPlace: parsedShowId.eventPlace,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin show detail fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin show details.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
