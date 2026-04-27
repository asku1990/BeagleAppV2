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

    const registrationNo = result.body.data.registrationNo.trim();
    const dogName = result.body.data.dogName?.trim() ?? null;
    const sireName = result.body.data.sireName?.trim() ?? null;
    const sireRegistrationNo =
      result.body.data.sireRegistrationNo?.trim() ?? null;
    const damName = result.body.data.damName?.trim() ?? null;
    const damRegistrationNo =
      result.body.data.damRegistrationNo?.trim() ?? null;
    const omistaja = result.body.data.omistaja?.trim() ?? null;
    const omistajanKotikunta =
      result.body.data.omistajanKotikunta?.trim() ?? null;
    const kennelpiiri = result.body.data.kennelpiiri?.trim() ?? null;
    const kennelpiirinro = result.body.data.kennelpiirinro?.trim() ?? null;
    const koekunta = result.body.data.koekunta?.trim() ?? null;
    const koemaasto = result.body.data.koemaasto?.trim() ?? null;
    const koepaiva = result.body.data.koepaiva;
    const trialRuleWindowId = result.body.data.trialRuleWindowId;
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

    const jarjestaja = result.body.data.jarjestaja?.trim() ?? null;
    const dogSex = result.body.data.dogSex;
    const era1Alkoi = result.body.data.era1Alkoi?.trim() ?? null;
    const era2Alkoi = result.body.data.era2Alkoi?.trim() ?? null;
    const hakuMin1 = result.body.data.hakuMin1;
    const hakuMin2 = result.body.data.hakuMin2;
    const ajoMin1 = result.body.data.ajoMin1;
    const ajoMin2 = result.body.data.ajoMin2;
    const hyvaksytytAjominuutit = result.body.data.hyvaksytytAjominuutit;
    const ajoajanPisteet = result.body.data.ajoajanPisteet;
    const hakuEra1 = result.body.data.hakuEra1;
    const hakuEra2 = result.body.data.hakuEra2;
    const hakuKeskiarvo = result.body.data.hakuKeskiarvo;
    const haukkuEra1 = result.body.data.haukkuEra1;
    const haukkuEra2 = result.body.data.haukkuEra2;
    const haukkuKeskiarvo = result.body.data.haukkuKeskiarvo;
    const ajotaitoEra1 = result.body.data.ajotaitoEra1;
    const ajotaitoEra2 = result.body.data.ajotaitoEra2;
    const ajotaitoKeskiarvo = result.body.data.ajotaitoKeskiarvo;
    const hakuloysyysTappioEra1 = result.body.data.hakuloysyysTappioEra1;
    const hakuloysyysTappioEra2 = result.body.data.hakuloysyysTappioEra2;
    const hakuloysyysTappioYhteensa =
      result.body.data.hakuloysyysTappioYhteensa;
    const ajoloysyysTappioEra1 = result.body.data.ajoloysyysTappioEra1;
    const ajoloysyysTappioEra2 = result.body.data.ajoloysyysTappioEra2;
    const ajoloysyysTappioYhteensa = result.body.data.ajoloysyysTappioYhteensa;
    const tappiopisteetYhteensa = result.body.data.tappiopisteetYhteensa;
    const ansiopisteetYhteensa = result.body.data.ansiopisteetYhteensa;
    const loppupisteet = result.body.data.loppupisteet;
    const paljasMaaTaiLumi = result.body.data.paljasMaaTaiLumi;
    const luopui = result.body.data.luopui;
    const suljettu = result.body.data.suljettu;
    const keskeytetty = result.body.data.keskeytetty;
    const koetyyppi = result.body.data.koetyyppi;
    const sijoitus = result.body.data.sijoitus;
    const koiriaLuokassa = result.body.data.koiriaLuokassa;
    const Palkinto = result.body.data.Palkinto;
    const huomautusTeksti = result.body.data.huomautusTeksti;

    const ryhmatuomariNimi = result.body.data.ryhmatuomariNimi;
    const palkintotuomariNimi = result.body.data.palkintotuomariNimi;
    const ylituomariNumeroSnapshot = result.body.data.ylituomariNumeroSnapshot;
    const ylituomariNimiSnapshot = result.body.data.ylituomariNimiSnapshot;
    const lisatiedotRows = result.body.data.lisatiedotRows;

    const pdfBytes = await renderTrialDogPdf({
      trialRuleWindowId,
      registrationNo,
      dogName,
      dogSex,
      sireName,
      sireRegistrationNo,
      damName,
      damRegistrationNo,
      omistaja,
      omistajanKotikunta,
      kennelpiiri,
      kennelpiirinro,
      koekunta,
      koemaasto,
      koepaiva,
      jarjestaja,
      era1Alkoi,
      era2Alkoi,
      hakuMin1,
      hakuMin2,
      ajoMin1,
      ajoMin2,
      hyvaksytytAjominuutit,
      ajoajanPisteet,
      hakuEra1,
      hakuEra2,
      hakuKeskiarvo,
      haukkuEra1,
      haukkuEra2,
      haukkuKeskiarvo,
      ajotaitoEra1,
      ajotaitoEra2,
      ajotaitoKeskiarvo,
      hakuloysyysTappioEra1,
      hakuloysyysTappioEra2,
      hakuloysyysTappioYhteensa,
      ajoloysyysTappioEra1,
      ajoloysyysTappioEra2,
      ajoloysyysTappioYhteensa,
      tappiopisteetYhteensa,
      ansiopisteetYhteensa,
      loppupisteet,
      paljasMaaTaiLumi,
      luopui,
      suljettu,
      keskeytetty,
      koetyyppi,
      sijoitus,
      koiriaLuokassa,
      Palkinto,
      huomautusTeksti,
      ryhmatuomariNimi,
      palkintotuomariNimi,
      ylituomariNumeroSnapshot,
      ylituomariNimiSnapshot,
      lisatiedotRows,
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
