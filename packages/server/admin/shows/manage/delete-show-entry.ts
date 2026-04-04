import {
  type CurrentUserDto,
  type DeleteAdminShowEntryRequest,
  type DeleteAdminShowEntryResponse,
} from "@beagle/contracts";
import { deleteAdminShowEntryWriteDb } from "@beagle/db";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";
import { parseShowId } from "@server/shows/internal/show-id";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

// Validates and deletes one admin entry inside a selected show event.
export async function deleteAdminShowEntry(
  input: DeleteAdminShowEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<DeleteAdminShowEntryResponse>> {
  const startedAt = Date.now();
  const parsedShowId = parseShowId(input.showId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-shows.deleteAdminShowEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!parsedShowId) {
    log.warn(
      { event: "invalid_show_id", durationMs: Date.now() - startedAt },
      "admin show entry delete rejected because showId is invalid",
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
      "admin show entry delete rejected by authorization",
    );
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const entryId = input.entryId.trim();
  if (!entryId) {
    log.warn(
      { event: "invalid_entry_id", durationMs: Date.now() - startedAt },
      "admin show entry delete rejected because entryId is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Entry id is required.",
        code: "INVALID_ENTRY_ID",
      },
    };
  }

  log.info(
    {
      event: "start",
      eventDate: parsedShowId.eventDateIsoDate,
      eventPlace: parsedShowId.eventPlace,
      eventKey: parsedShowId.eventKey,
      entryId,
    },
    "admin show entry delete started",
  );

  try {
    const result = await deleteAdminShowEntryWriteDb({
      eventKey: parsedShowId.eventKey,
      eventDate: parsedShowId.eventDate,
      eventPlace: parsedShowId.eventPlace,
      entryId,
    });

    if (result.status === "not_found") {
      log.warn(
        {
          event: "not_found",
          entryId,
          durationMs: Date.now() - startedAt,
        },
        "admin show entry delete failed because entry was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Entry not found in selected show.",
          code: "ENTRY_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        entryId: result.entryId,
        durationMs: Date.now() - startedAt,
      },
      "admin show entry delete succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          deletedEntryId: result.entryId,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        entryId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin show entry delete failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin show entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
