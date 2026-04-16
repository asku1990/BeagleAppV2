import {
  type KoiratietokantaAjokUpsertRequest,
  type KoiratietokantaAjokUpsertResponse,
} from "@beagle/contracts";
import { upsertKoiratietokantaAjokResultDb } from "@beagle/db";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { mapKoiratietokantaAjokPayload } from "./internal/map-ajok-payload";

export async function upsertKoiratietokantaAjokResultService(
  payload: KoiratietokantaAjokUpsertRequest,
): Promise<ServiceResult<KoiratietokantaAjokUpsertResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "trials.integrations.koiratietokanta.upsertAjokResult",
  });

  const mapped = mapKoiratietokantaAjokPayload(payload);
  if (!mapped.ok) {
    log.warn(
      { event: "validation_failed", issues: mapped.issues },
      "koiratietokanta AJOK result rejected because required fields are invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Invalid AJOK result payload.",
        details: mapped.issues,
      },
    };
  }

  try {
    const result = await upsertKoiratietokantaAjokResultDb({
      event: mapped.event,
      entry: mapped.entry,
      lisatiedot: mapped.lisatiedot,
    });
    const warnings = [...mapped.warnings];

    if (!result.dogFound) {
      warnings.push({
        code: "DOG_NOT_FOUND",
        field: "REKISTERINUMERO",
        message: "Result saved without a dog link.",
      });
    }

    const logPayload = {
      event: warnings.length > 0 ? "upserted_with_warnings" : "upserted",
      trialEventId: result.trialEventId,
      trialEntryId: result.trialEntryId,
      created: result.created,
      updated: result.updated,
      warningCount: warnings.length,
      warnings: warnings.map(({ code, field }) => ({ code, field })),
      durationMs: Date.now() - startedAt,
    };
    if (warnings.length > 0) {
      log.warn(
        logPayload,
        "koiratietokanta AJOK result upserted with warnings",
      );
    } else {
      log.info(logPayload, "koiratietokanta AJOK result upserted");
    }

    return {
      status: result.created ? 201 : 200,
      body: {
        ok: true,
        data: {
          trialEventId: result.trialEventId,
          trialEntryId: result.trialEntryId,
          created: result.created,
          updated: result.updated,
          warnings,
        },
      },
    };
  } catch (error) {
    log.error(
      { ...toErrorLog(error), durationMs: Date.now() - startedAt },
      "koiratietokanta AJOK result upsert failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        code: "UNEXPECTED_ERROR",
        error: "Unexpected AJOK result upsert error.",
      },
    };
  }
}
