import { getTrialDogPdfDataService } from "@server/trials/pdf/get-trial-dog-pdf-data";
import { toErrorLog, withLogContext } from "@server/core/logger";
import { type NextRequest, NextResponse } from "next/server";
import {
  jsonResponse,
  optionsResponse,
  withCorsHeaders,
} from "@/lib/server/cors";
import {
  canRenderTrialDogPdf,
  getTrialDogPdfRuleSetId,
  renderTrialDogPdf,
} from "@/lib/public/beagle/trials/pdf";

const METHODS = "GET,OPTIONS";

export const runtime = "nodejs";

function normalizeTrialId(value: string): string {
  return value.trim();
}

function createRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse(METHODS, {
    origin: request.headers.get("origin"),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ trialId: string }> },
) {
  const startedAt = Date.now();
  const requestId = createRequestId(request);
  const log = withLogContext({
    layer: "api",
    route: "trials.pdf",
    requestId,
  });

  try {
    const { trialId } = await context.params;
    const normalizedTrialId = normalizeTrialId(trialId);
    const result = await getTrialDogPdfDataService(normalizedTrialId, {
      requestId,
    });

    if (!result.body.ok) {
      return jsonResponse(result.body, {
        status: result.status,
        methods: METHODS,
        origin: request.headers.get("origin"),
      });
    }

    // trialId is a server-only field not part of TrialDogPdfPayload; it stays in restData
    // but TypeScript won't flag the extra property when the payload variable is passed to a function.
    const { trialRuleWindowId, ...restData } = result.body.data;
    if (!canRenderTrialDogPdf(trialRuleWindowId)) {
      const ruleSetId = getTrialDogPdfRuleSetId(trialRuleWindowId);
      log.warn(
        {
          event: "unsupported_rule_window",
          trialId: normalizedTrialId,
          trialRuleWindowId,
          ruleSetId,
          durationMs: Date.now() - startedAt,
        },
        "trial pdf generation rejected because rule window has no template",
      );

      return jsonResponse(
        {
          ok: false,
          error: "Trial PDF is not available for this rule window.",
          code: "TRIAL_PDF_NOT_AVAILABLE",
        },
        {
          status: 404,
          methods: METHODS,
          origin: request.headers.get("origin"),
        },
      );
    }

    // Spread all payload fields; only trim the string fields that may arrive with whitespace.
    const payload = {
      ...restData,
      trialRuleWindowId,
      registrationNo: restData.registrationNo.trim(),
      dogName: restData.dogName?.trim() ?? null,
      sireName: restData.sireName?.trim() ?? null,
      sireRegistrationNo: restData.sireRegistrationNo?.trim() ?? null,
      damName: restData.damName?.trim() ?? null,
      damRegistrationNo: restData.damRegistrationNo?.trim() ?? null,
      omistaja: restData.omistaja?.trim() ?? null,
      omistajanKotikunta: restData.omistajanKotikunta?.trim() ?? null,
      kennelpiiri: restData.kennelpiiri?.trim() ?? null,
      kennelpiirinro: restData.kennelpiirinro?.trim() ?? null,
      koekunta: restData.koekunta?.trim() ?? null,
      koemaasto: restData.koemaasto?.trim() ?? null,
      jarjestaja: restData.jarjestaja?.trim() ?? null,
      era1Alkoi: restData.era1Alkoi?.trim() ?? null,
      era2Alkoi: restData.era2Alkoi?.trim() ?? null,
    };

    const pdfBytes = await renderTrialDogPdf(payload);

    log.info(
      {
        event: "success",
        trialId: normalizedTrialId,
        registrationNo: payload.registrationNo,
        dogName: payload.dogName,
        kennelpiiri: payload.kennelpiiri,
        durationMs: Date.now() - startedAt,
      },
      "trial pdf generation succeeded",
    );

    return withCorsHeaders(
      new NextResponse(Buffer.from(pdfBytes), {
        status: 200,
        headers: {
          "Content-Disposition":
            'inline; filename="ajok-koirakohtainen-poytakirja.pdf"',
          "Content-Type": "application/pdf",
        },
      }),
      {
        methods: METHODS,
        origin: request.headers.get("origin"),
      },
    );
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "trial pdf generation failed",
    );
    return jsonResponse(
      {
        ok: false,
        error: "Failed to generate trial pdf.",
        code: "INTERNAL_ERROR",
      },
      {
        status: 500,
        methods: METHODS,
        origin: request.headers.get("origin"),
      },
    );
  }
}
