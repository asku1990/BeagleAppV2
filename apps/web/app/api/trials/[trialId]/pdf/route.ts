import { getTrialDogPdfDataService } from "@server/trials/pdf/get-trial-dog-pdf-data";
import { toErrorLog, withLogContext } from "@server/core/logger";
import { type NextRequest, NextResponse } from "next/server";
import {
  jsonResponse,
  optionsResponse,
  withCorsHeaders,
} from "@/lib/server/cors";
import { renderTrialDogPdf } from "@/lib/server/trials";

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

    const registrationNo = result.body.data.registrationNo.trim();
    const dogName = result.body.data.dogName?.trim() ?? null;
    const kennelpiiri = result.body.data.kennelpiiri?.trim() ?? null;
    const kennelpiirinro = result.body.data.kennelpiirinro?.trim() ?? null;
    const koekunta = result.body.data.koekunta?.trim() ?? null;
    const koepaiva = result.body.data.koepaiva;
    const jarjeastaja = result.body.data.jarjestaja?.trim() ?? null;

    const pdfBytes = await renderTrialDogPdf({
      registrationNo,
      dogName,
      dogSex: result.body.data.dogSex,
      kennelpiiri,
      kennelpiirinro,
      koekunta,
      koepaiva,
      jarjeastaja,
    });

    log.info(
      {
        event: "success",
        trialId: normalizedTrialId,
        registrationNo,
        dogName,
        kennelpiiri,
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
