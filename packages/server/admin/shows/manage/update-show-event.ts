import {
  type CurrentUserDto,
  type UpdateAdminShowEventRequest,
  type UpdateAdminShowEventResponse,
} from "@beagle/contracts";
import { updateAdminShowEventWriteDb } from "@beagle/db";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import { isPrismaTransactionTimeoutError } from "@server/core/prisma-transaction-timeout";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";
import { parseIsoDateOnlyToUtcDate } from "@server/shows/internal/iso-date";
import { encodeShowId, parseShowId } from "@server/shows/internal/show-id";
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from "./internal/input-normalization";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

function normalizePlaceKey(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

export async function updateAdminShowEvent(
  input: UpdateAdminShowEventRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<UpdateAdminShowEventResponse>> {
  const startedAt = Date.now();
  const parsedShowId = parseShowId(input.showId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-shows.updateAdminShowEvent",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!parsedShowId) {
    log.warn(
      { event: "invalid_show_id", durationMs: Date.now() - startedAt },
      "admin show update rejected because showId is invalid",
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

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin show update rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const normalizedEventDate = input.eventDate.trim();
  const eventDate = parseIsoDateOnlyToUtcDate(normalizedEventDate);
  if (!eventDate) {
    log.warn(
      {
        event: "invalid_event_date",
        eventDate: input.eventDate,
        durationMs: Date.now() - startedAt,
      },
      "admin show update rejected because event date is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Event date must use YYYY-MM-DD format.",
        code: "INVALID_EVENT_DATE",
      },
    };
  }

  const eventPlace = normalizeRequiredText(input.eventPlace);
  if (!eventPlace) {
    log.warn(
      { event: "invalid_event_place", durationMs: Date.now() - startedAt },
      "admin show update rejected because event place is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Event place is required.",
        code: "INVALID_EVENT_PLACE",
      },
    };
  }

  const eventDateIso = toBusinessDateOnly(eventDate);
  const nextEventLookupKey = `${eventDateIso}|${normalizePlaceKey(eventPlace)}`;
  const eventCity = normalizeOptionalText(input.eventCity);
  const eventName = normalizeOptionalText(input.eventName);
  const eventType = normalizeOptionalText(input.eventType);
  const organizer = normalizeOptionalText(input.organizer);
  const judge = normalizeOptionalText(input.judge);

  log.info(
    {
      event: "start",
      currentEventDate: parsedShowId.eventDateIsoDate,
      currentEventPlace: parsedShowId.eventPlace,
      currentEventKey: parsedShowId.eventKey,
      nextEventDate: eventDateIso,
      nextEventPlace: eventPlace,
      nextEventLookupKey,
    },
    "admin show update started",
  );

  try {
    const result = await updateAdminShowEventWriteDb({
      eventKey: parsedShowId.eventKey,
      eventDate: parsedShowId.eventDate,
      eventPlace: parsedShowId.eventPlace,
      nextEventLookupKey,
      nextEventDate: eventDate,
      nextEventPlace: eventPlace,
      nextEventCity: eventCity,
      nextEventName: eventName,
      nextEventType: eventType,
      nextOrganizer: organizer,
      nextJudge: judge,
    });

    if (result.status === "not_found") {
      log.warn(
        {
          event: "not_found",
          currentEventDate: parsedShowId.eventDateIsoDate,
          currentEventPlace: parsedShowId.eventPlace,
          durationMs: Date.now() - startedAt,
        },
        "admin show update failed because show was not found",
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

    if (result.status === "event_lookup_conflict") {
      log.warn(
        {
          event: "event_lookup_conflict",
          nextEventLookupKey,
          durationMs: Date.now() - startedAt,
        },
        "admin show update rejected because target event key already exists",
      );
      return {
        status: 409,
        body: {
          ok: false,
          error: "Another show already exists for this date and place.",
          code: "EVENT_LOOKUP_CONFLICT",
        },
      };
    }

    const response: UpdateAdminShowEventResponse = {
      showId: encodeShowId(
        toBusinessDateOnly(result.row.eventDate),
        result.row.eventPlace,
        result.row.eventKey,
      ),
      eventDate: toBusinessDateOnly(result.row.eventDate),
      eventPlace: result.row.eventPlace,
      eventCity: result.row.eventCity ?? "",
      eventName: result.row.eventName ?? "",
      eventType: result.row.eventType ?? "",
      organizer: result.row.organizer ?? "",
      judge: result.row.judge ?? "",
    };

    log.info(
      {
        event: "success",
        showId: response.showId,
        durationMs: Date.now() - startedAt,
      },
      "admin show update succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: response,
      },
    };
  } catch (error) {
    const isTimeout = isPrismaTransactionTimeoutError(error);
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        isTransactionTimeout: isTimeout,
        ...toErrorLog(error),
      },
      "admin show update failed",
    );
    return {
      status: isTimeout ? 409 : 500,
      body: {
        ok: false,
        error: isTimeout
          ? "Show update timed out before commit. Retry the update."
          : "Failed to update admin show event.",
        code: isTimeout ? "WRITE_TIMEOUT" : "INTERNAL_ERROR",
      },
    };
  }
}
