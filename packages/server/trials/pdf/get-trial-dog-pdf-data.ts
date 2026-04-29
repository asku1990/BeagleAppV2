import type { TrialDogPdfPayloadWithTrialId } from "@contracts";
import { getTrialDogPdfDataDb } from "@db/trials/pdf";
import type { TrialDogPdfDataDbEraRow } from "@db/trials/pdf";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

function normalizeTrialId(value: string): string {
  return value.trim();
}

function mapKeliToPaljasMaaTaiLumi(
  keli: string | null,
): "PALJAS_MAA" | "LUMI" | null {
  if (keli === "P") {
    return "PALJAS_MAA";
  }

  if (keli === "L") {
    return "LUMI";
  }

  return null;
}

function mapHuomautusToStatusMarkers(huomautus: string | null): {
  luopui: boolean;
  suljettu: boolean;
  keskeytetty: boolean;
} {
  return {
    luopui: huomautus === "LUOPUI",
    suljettu: huomautus === "SULJETTU",
    keskeytetty: huomautus === "KESKEYTETTY",
  };
}

function sumNullableNumbers(values: Array<number | null>): number | null {
  let sum = 0;
  let hasValue = false;

  for (const value of values) {
    if (value === null) {
      continue;
    }
    sum += value;
    hasValue = true;
  }

  return hasValue ? sum : null;
}

function joinUniqueText(values: Array<string | null>): string | null {
  const seen = new Set<string>();
  const parts: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    parts.push(normalized);
  }

  return parts.length > 0 ? parts.join(" ") : null;
}

function calculateAnsiopisteet(
  haku: number | null,
  hauk: number | null,
  pin: number | null,
  yva: number | null,
): number | null {
  return sumNullableNumbers([haku, hauk, pin, yva]);
}

function calculateTappiopisteet(
  hlo: number | null,
  alo: number | null,
): number | null {
  return sumNullableNumbers([hlo, alo]);
}

function calculateAjoajanPisteet(ajominuutit: number | null): number | null {
  if (ajominuutit === null) {
    return null;
  }

  return Math.round((70 / 240) * ajominuutit * 100) / 100;
}

const OLOSUHDE_KOODIT = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
] as const;

const HAKU_KOODIT = ["20", "21", "22"] as const;
const HAUKKU_KOODIT = ["30", "31", "32", "33", "34", "35", "36"] as const;
const METSASTYSINTO_KOODIT = ["40", "41", "42"] as const;
const AJO_KOODIT = ["50", "51", "52", "53", "54", "55", "56"] as const;
const MUUT_OMINAISUUDET_KOODIT = ["60", "61"] as const;
const LISATIETO_KOODIT: ReadonlySet<string> = new Set([
  ...OLOSUHDE_KOODIT,
  ...HAKU_KOODIT,
  ...HAUKKU_KOODIT,
  ...METSASTYSINTO_KOODIT,
  ...AJO_KOODIT,
  ...MUUT_OMINAISUUDET_KOODIT,
]);

function toEraMap(
  eras: TrialDogPdfDataDbEraRow[],
): Map<number, TrialDogPdfDataDbEraRow> {
  return new Map(eras.map((era) => [era.era, era]));
}

function pivotLisatiedot(
  eras: TrialDogPdfDataDbEraRow[],
): Array<{ koodi: string; era1: string | null; era2: string | null }> {
  const byCode = new Map<
    string,
    { era1: string | null; era2: string | null }
  >();

  for (const era of eras) {
    if (era.era !== 1 && era.era !== 2) {
      continue;
    }

    for (const item of era.lisatiedot) {
      if (!LISATIETO_KOODIT.has(item.koodi)) {
        continue;
      }
      if (!byCode.has(item.koodi)) {
        byCode.set(item.koodi, { era1: null, era2: null });
      }
      const current = byCode.get(item.koodi);
      if (!current) continue;
      if (era.era === 1) current.era1 = item.arvo;
      if (era.era === 2) current.era2 = item.arvo;
    }
  }

  return Array.from(byCode.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([koodi, values]) => ({ koodi, ...values }));
}

export async function getTrialDogPdfDataService(
  trialId: string,
  context?: { requestId?: string },
): Promise<ServiceResult<TrialDogPdfPayloadWithTrialId>> {
  const startedAt = Date.now();
  const normalizedTrialId = normalizeTrialId(trialId);
  const log = withLogContext({
    layer: "service",
    useCase: "trials.getTrialDogPdfData",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
  });

  if (!normalizedTrialId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial id.",
        code: "INVALID_TRIAL_ID",
      },
    };
  }

  try {
    const result = await getTrialDogPdfDataDb({
      trialId: normalizedTrialId,
    });

    if (!result) {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial not found.",
          code: "TRIAL_NOT_FOUND",
        },
      };
    }

    const eraByNumber = toEraMap(result.eras);
    const era1 = eraByNumber.get(1);
    const era2 = eraByNumber.get(2);
    const hyvaksytytAjominuutit =
      result.hyvaksytytAjominuutit ??
      sumNullableNumbers([era1?.ajomin ?? null, era2?.ajomin ?? null]);
    const ajoajanPisteet =
      result.ajoajanPisteet ?? calculateAjoajanPisteet(hyvaksytytAjominuutit);
    const ansiopisteetYhteensa =
      result.ansiopisteetYhteensa ??
      calculateAnsiopisteet(result.haku, result.hauk, result.pin, result.yva);
    const tappiopisteetYhteensa =
      result.tappiopisteetYhteensa ??
      calculateTappiopisteet(result.hlo, result.alo);
    const lisatiedotRows = pivotLisatiedot(result.eras);
    const huomautusMarkers = mapHuomautusToStatusMarkers(result.huomautus);
    const huomautusTeksti = joinUniqueText([
      result.huomautusTeksti,
      ...result.eras.map((era) => era.huomautusTeksti),
    ]);

    log.info(
      {
        event: "success",
        trialId: normalizedTrialId,
        hasRegistrationNo: Boolean(result.registrationNo),
        durationMs: Date.now() - startedAt,
      },
      "trial dog pdf data fetch succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trialId: result.trialId,
          trialRuleWindowId: result.trialRuleWindowId,
          registrationNo: result.registrationNo,
          dogName: result.dogName,
          dogSex: result.dogSex,
          sireName: result.sireName,
          sireRegistrationNo: result.sireRegistrationNo,
          damName: result.damName,
          damRegistrationNo: result.damRegistrationNo,
          omistaja: result.omistaja,
          omistajanKotikunta: result.omistajanKotikunta,
          kennelpiiri: result.kennelpiiri,
          kennelpiirinro: result.kennelpiirinro,
          koekunta: result.koekunta,
          koemaasto: result.koemaasto,
          koepaiva: result.koepaiva,
          jarjestaja: result.jarjestaja,
          era1Alkoi: era1?.alkoi ?? null,
          era2Alkoi: era2?.alkoi ?? null,
          hakuMin1: era1?.hakumin ?? null,
          hakuMin2: era2?.hakumin ?? null,
          ajoMin1: era1?.ajomin ?? null,
          ajoMin2: era2?.ajomin ?? null,
          hyvaksytytAjominuutit,
          ajoajanPisteet,
          hakuEra1: era1?.haku ?? null,
          hakuEra2: era2?.haku ?? null,
          hakuKeskiarvo: result.haku,
          haukkuEra1: era1?.hauk ?? null,
          haukkuEra2: era2?.hauk ?? null,
          haukkuKeskiarvo: result.hauk,
          metsastysintoEra1: era1?.pin ?? null,
          metsastysintoEra2: era2?.pin ?? null,
          metsastysintoKeskiarvo: result.pin,
          ajotaitoEra1: era1?.yva ?? null,
          ajotaitoEra2: era2?.yva ?? null,
          ajotaitoKeskiarvo: result.yva,
          hakuloysyysTappioEra1: era1?.hlo ?? null,
          hakuloysyysTappioEra2: era2?.hlo ?? null,
          hakuloysyysTappioYhteensa: result.hlo,
          ajoloysyysTappioEra1: era1?.alo ?? null,
          ajoloysyysTappioEra2: era2?.alo ?? null,
          ajoloysyysTappioYhteensa: result.alo,
          tappiopisteetYhteensa,
          ansiopisteetYhteensa,
          loppupisteet: result.loppupisteet,
          paljasMaaTaiLumi: mapKeliToPaljasMaaTaiLumi(result.ke),
          luopui: huomautusMarkers.luopui,
          suljettu: huomautusMarkers.suljettu,
          keskeytetty: huomautusMarkers.keskeytetty,
          koetyyppi: result.koetyyppi,
          sijoitus: result.sijoitus,
          koiriaLuokassa: result.koiriaLuokassa,
          Palkinto: result.palkinto,
          huomautusTeksti,
          ryhmatuomariNimi: result.ryhmatuomariNimi,
          palkintotuomariNimi: result.palkintotuomariNimi,
          ylituomariNumeroSnapshot: result.ylituomariNumeroSnapshot,
          ylituomariNimiSnapshot:
            result.ylituomariNimiSnapshot ?? result.ylituomariNimi,
          lisatiedotRows,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialId: normalizedTrialId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "trial dog pdf data fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load trial dog pdf data.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
