import {
  type CurrentUserDto,
  type UpdateAdminShowEntryRequest,
  type UpdateAdminShowEntryResponse,
} from "@beagle/contracts";
import { updateAdminShowEntryWriteDb } from "@beagle/db";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";
import { parseShowId } from "@server/shows/internal/show-id";
import {
  normalizeOptionalText,
  normalizeRequiredText,
} from "./internal/input-normalization";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const PUPN_MIN_RANK = 1;
const PUPN_MAX_RANK = 4;

function parseHeightText(value: string): string | null | "INVALID" {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return "INVALID";
  }
  return String(parsed);
}

function parseClassPlacement(value: string): number | null | "INVALID" {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  if (!/^\d+$/.test(normalized)) {
    return "INVALID";
  }
  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "INVALID";
  }
  return parsed;
}

function parsePupn(value: string): string | null | "INVALID" {
  const normalized = value.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  const match = /^(PU|PN)(\d+)$/.exec(normalized);
  if (!match) {
    return "INVALID";
  }

  const rank = Number.parseInt(match[2], 10);
  if (!Number.isFinite(rank) || rank < PUPN_MIN_RANK || rank > PUPN_MAX_RANK) {
    return "INVALID";
  }

  return normalized;
}

function normalizeAwardCodes(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const rawValue of values) {
    const normalized = normalizeRequiredText(rawValue);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

// Validates and persists one admin entry edit inside a selected show event.
export async function updateAdminShowEntry(
  input: UpdateAdminShowEntryRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<UpdateAdminShowEntryResponse>> {
  const startedAt = Date.now();
  const parsedShowId = parseShowId(input.showId);
  const log = withLogContext({
    layer: "service",
    useCase: "admin-shows.updateAdminShowEntry",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  if (!parsedShowId) {
    log.warn(
      { event: "invalid_show_id", durationMs: Date.now() - startedAt },
      "admin show entry update rejected because showId is invalid",
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
      "admin show entry update rejected by authorization",
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
      "admin show entry update rejected because entryId is invalid",
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

  const heightText = parseHeightText(input.heightCm);
  if (heightText === "INVALID") {
    log.warn(
      {
        event: "invalid_height_cm",
        entryId,
        heightCm: input.heightCm,
        durationMs: Date.now() - startedAt,
      },
      "admin show entry update rejected because height is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Height must be a non-negative number.",
        code: "INVALID_HEIGHT_CM",
      },
    };
  }

  const classPlacement = parseClassPlacement(input.classPlacement);
  if (classPlacement === "INVALID") {
    log.warn(
      {
        event: "invalid_class_placement",
        entryId,
        classPlacement: input.classPlacement,
        durationMs: Date.now() - startedAt,
      },
      "admin show entry update rejected because class placement is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Class placement must be a positive integer.",
        code: "INVALID_CLASS_PLACEMENT",
      },
    };
  }

  const pupn = parsePupn(input.pupn);
  if (pupn === "INVALID") {
    log.warn(
      {
        event: "invalid_pupn",
        entryId,
        pupn: input.pupn,
        durationMs: Date.now() - startedAt,
      },
      "admin show entry update rejected because PUPN is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "PUPN must use PU/PN with rank 1-4.",
        code: "INVALID_PUPN",
      },
    };
  }

  const classCode = normalizeOptionalText(input.classCode);
  const qualityGrade = normalizeOptionalText(input.qualityGrade);
  const awards = normalizeAwardCodes(input.awards);
  const judge = normalizeOptionalText(input.judge);
  const critiqueText = normalizeOptionalText(input.critiqueText);

  log.info(
    {
      event: "start",
      eventDate: parsedShowId.eventDateIsoDate,
      eventPlace: parsedShowId.eventPlace,
      eventKey: parsedShowId.eventKey,
      entryId,
      classCode,
      qualityGrade,
      classPlacement,
      pupn,
      awardCount: awards.length,
    },
    "admin show entry update started",
  );

  try {
    const result = await updateAdminShowEntryWriteDb({
      eventKey: parsedShowId.eventKey,
      eventDate: parsedShowId.eventDate,
      eventPlace: parsedShowId.eventPlace,
      entryId,
      judge,
      critiqueText,
      heightText,
      classCode,
      qualityGrade,
      classPlacement,
      pupn,
      awards,
    });

    if (result.status === "not_found") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Entry not found in selected show.",
          code: "ENTRY_NOT_FOUND",
        },
      };
    }

    if (result.status === "invalid_class_code") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Invalid class code.",
          code: "INVALID_CLASS_CODE",
        },
      };
    }

    if (result.status === "invalid_quality_grade") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Invalid quality grade.",
          code: "INVALID_QUALITY_GRADE",
        },
      };
    }

    if (result.status === "invalid_award_code") {
      return {
        status: 400,
        body: {
          ok: false,
          error: `Invalid award code: ${result.awardCode}.`,
          code: "INVALID_AWARD_CODE",
        },
      };
    }

    if (
      result.status === "missing_placement_definition" ||
      result.status === "missing_pupn_definition"
    ) {
      return {
        status: 500,
        body: {
          ok: false,
          error: "Show result definitions are incomplete for entry editing.",
          code: "SHOW_RESULT_SCHEMA_INCOMPLETE",
        },
      };
    }

    log.info(
      {
        event: "success",
        entryId: result.entryId,
        durationMs: Date.now() - startedAt,
      },
      "admin show entry update succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          entryId: result.entryId,
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
      "admin show entry update failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update admin show entry.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
