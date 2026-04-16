import {
  type KoiratietokantaAjokUpsertRequest,
  type KoiratietokantaAjokValidationIssue,
  type KoiratietokantaAjokWarning,
} from "@beagle/contracts";
import type {
  KoiratietokantaAjokEntryDbInput,
  KoiratietokantaAjokEventDbInput,
} from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeRegistrationNo,
} from "@server/imports/core";
import {
  isRecord,
  normalizeText,
  parseBooleanFlag,
  parseInteger,
  parseKoepvm,
  parseOptionalDecimal,
  parseOptionalInteger,
} from "./parse-ajok-payload";
import { mapKoiratietokantaAjokLisatiedot } from "./map-ajok-lisatiedot";

type MapperResult =
  | {
      ok: true;
      event: KoiratietokantaAjokEventDbInput;
      entry: KoiratietokantaAjokEntryDbInput;
      lisatiedot: ReturnType<typeof mapKoiratietokantaAjokLisatiedot>;
      warnings: KoiratietokantaAjokWarning[];
    }
  | {
      ok: false;
      issues: KoiratietokantaAjokValidationIssue[];
    };

// Maps one raw yksi_tulos-style payload into the canonical AJOK event/entry
// write model while preserving optional parse issues as warnings.
export function mapKoiratietokantaAjokPayload(
  payload: KoiratietokantaAjokUpsertRequest,
): MapperResult {
  if (!isRecord(payload)) {
    return {
      ok: false,
      issues: [
        {
          field: "$",
          code: "INVALID",
          message: "Payload must be a JSON object.",
        },
      ],
    };
  }

  const issues: KoiratietokantaAjokValidationIssue[] = [];
  const warnings: KoiratietokantaAjokWarning[] = [];
  const sklKoeId = parseInteger(payload.SKLid);
  if (sklKoeId === null) {
    issues.push({
      field: "SKLid",
      code: payload.SKLid == null ? "REQUIRED" : "INVALID",
      message: "SKLid is required and must be an integer.",
    });
  }

  const registrationNo = normalizeRegistrationNo(
    normalizeText(payload.REKISTERINUMERO),
  );
  if (!registrationNo || !isValidRegistrationNo(registrationNo)) {
    issues.push({
      field: "REKISTERINUMERO",
      code: registrationNo ? "INVALID" : "REQUIRED",
      message: "REKISTERINUMERO is required and must be valid.",
    });
  }

  const koepaiva = parseKoepvm(payload.Koepvm);
  if (!koepaiva) {
    issues.push({
      field: "Koepvm",
      code: payload.Koepvm == null ? "REQUIRED" : "INVALID",
      message: "Koepvm is required and must be a valid date.",
    });
  }

  const koekunta = normalizeText(payload.KOEPAIKKA);
  if (!koekunta) {
    issues.push({
      field: "KOEPAIKKA",
      code: payload.KOEPAIKKA == null ? "REQUIRED" : "INVALID",
      message: "KOEPAIKKA is required.",
    });
  }

  if (
    issues.length > 0 ||
    sklKoeId === null ||
    !registrationNo ||
    !koepaiva ||
    !koekunta
  ) {
    return { ok: false, issues };
  }

  const ylituomariNimi = normalizeText(payload.yt);
  const ylituomariNumero = normalizeText(payload.ytnro);

  return {
    ok: true,
    warnings,
    lisatiedot: mapKoiratietokantaAjokLisatiedot(payload),
    event: {
      sklKoeId,
      koepaiva,
      koekunta,
      jarjestaja: normalizeText(payload.JARJESTAJA),
      kennelpiiri: normalizeText(payload.KENNELPIIRI),
      kennelpiirinro:
        normalizeText(payload.KENNELPIIRINRO) ??
        normalizeText(payload.SKLkennelpiiri),
      koemuoto:
        normalizeText(payload.SKLkoemuoto) ?? normalizeText(payload.KOEMUOTO),
      ylituomariNimi,
      ylituomariNumero,
      ytKertomus: normalizeText(payload.YTkertomus),
    },
    entry: {
      rekisterinumeroSnapshot: registrationNo,
      yksilointiAvain: `SKL:${sklKoeId}|REG:${registrationNo}`,
      raakadataJson: JSON.stringify(payload),
      luokka: normalizeText(payload.LUOKKA),
      omistajaSnapshot: normalizeText(payload.Omistaja),
      omistajanKotikuntaSnapshot: normalizeText(payload.Omistajankotipaikka),
      era1Alkoi: normalizeText(payload.I_ERA_KLO),
      era2Alkoi: normalizeText(payload.II_ERA_KLO),
      era3Alkoi: normalizeText(payload.III_ERA_KLO),
      era4Alkoi: normalizeText(payload.IV_ERA_KLO),
      hakuMin1: parseOptionalInteger(payload, "i_haku_min", warnings),
      hakuMin2: parseOptionalInteger(payload, "II_HAKU_MIN", warnings),
      hakuMin3: parseOptionalInteger(payload, "III_HAKU_MIN", warnings),
      hakuMin4: parseOptionalInteger(payload, "IV_HAKU_MIN", warnings),
      ajoMin1: parseOptionalInteger(payload, "I_AJO_MIN", warnings),
      ajoMin2: parseOptionalInteger(payload, "II_AJO_MIN", warnings),
      ajoMin3: parseOptionalInteger(payload, "III_AJO_MIN", warnings),
      ajoMin4: parseOptionalInteger(payload, "IV_AJO_MIN", warnings),
      hyvaksytytAjominuutit: parseOptionalInteger(
        payload,
        "HYV_AJOT_MIN",
        warnings,
      ),
      ajoajanPisteet: parseOptionalDecimal(payload, "AJOPISTEET", warnings),
      hakuEra1: parseOptionalDecimal(payload, "I_HAKU", warnings),
      hakuEra2: parseOptionalDecimal(payload, "II_HAKU", warnings),
      hakuEra3: parseOptionalDecimal(payload, "III_HAKU", warnings),
      hakuEra4: parseOptionalDecimal(payload, "IV_HAKU", warnings),
      hakuKeskiarvo: parseOptionalDecimal(payload, "HAKUPISTEET", warnings),
      haukkuEra1: parseOptionalDecimal(payload, "I_HAUKKU", warnings),
      haukkuEra2: parseOptionalDecimal(payload, "II_HAUKKU", warnings),
      haukkuEra3: parseOptionalDecimal(payload, "III_HAUKKU", warnings),
      haukkuEra4: parseOptionalDecimal(payload, "IV_HAUKKU", warnings),
      haukkuKeskiarvo: parseOptionalDecimal(payload, "HAUKKUPISTEET", warnings),
      ajotaitoEra1: parseOptionalDecimal(payload, "I_AJOTAITO", warnings),
      ajotaitoEra2: parseOptionalDecimal(payload, "II_AJOTAITO", warnings),
      ajotaitoEra3: parseOptionalDecimal(payload, "III_AJOTAITO", warnings),
      ajotaitoEra4: parseOptionalDecimal(payload, "IV_AJOTAITO", warnings),
      ajotaitoKeskiarvo: parseOptionalDecimal(
        payload,
        "AJOTAITOPISTEET",
        warnings,
      ),
      ansiopisteetYhteensa: parseOptionalDecimal(
        payload,
        "ANSIOPISTEET",
        warnings,
      ),
      hakuloysyysTappioEra1: parseOptionalDecimal(
        payload,
        "I_HAKULOYSYYS",
        warnings,
      ),
      hakuloysyysTappioEra2: parseOptionalDecimal(
        payload,
        "II_HAKULOYSYYS",
        warnings,
      ),
      hakuloysyysTappioEra3: parseOptionalDecimal(
        payload,
        "III_HAKULOYSYYS",
        warnings,
      ),
      hakuloysyysTappioEra4: parseOptionalDecimal(
        payload,
        "IV_HAKULOYSYYS",
        warnings,
      ),
      hakuloysyysTappioYhteensa: parseOptionalDecimal(
        payload,
        "HAKULOYSYYSPISTEET",
        warnings,
      ),
      ajoloysyysTappioEra1: parseOptionalDecimal(
        payload,
        "I_AJOLOYSYYS",
        warnings,
      ),
      ajoloysyysTappioEra2: parseOptionalDecimal(
        payload,
        "II_AJOLOYSYYS",
        warnings,
      ),
      ajoloysyysTappioEra3: parseOptionalDecimal(
        payload,
        "III_AJOLOYSYYS",
        warnings,
      ),
      ajoloysyysTappioEra4: parseOptionalDecimal(
        payload,
        "IV_AJOLOYSYYS",
        warnings,
      ),
      ajoloysyysTappioYhteensa: parseOptionalDecimal(
        payload,
        "AJOLOYSYYSPISTEET",
        warnings,
      ),
      tappiopisteetYhteensa: parseOptionalDecimal(
        payload,
        "TAPPIOPISTEET",
        warnings,
      ),
      loppupisteet: parseOptionalDecimal(payload, "LOPPUPISTEET", warnings),
      palkinto: normalizeText(payload.PALKINTOSIJA),
      sijoitus: normalizeText(payload.SIJOITUS_LUOKASSA),
      koiriaLuokassa: parseOptionalInteger(
        payload,
        "KOIRIA_LUOKASSA",
        warnings,
      ),
      keli: normalizeText(payload.KELI),
      luopui: parseBooleanFlag(payload.luopui),
      suljettu: parseBooleanFlag(payload.suljettu),
      keskeytetty: parseBooleanFlag(payload.keskeytti),
      huomautusTeksti: normalizeText(payload.HUOMAUTUS),
      ylituomariNimiSnapshot: ylituomariNimi,
      ylituomariNumeroSnapshot: ylituomariNumero,
      ryhmatuomariNimi: normalizeText(payload.palkintotuomari1),
      palkintotuomariNimi: normalizeText(payload.palkintotuomari2),
    },
  };
}
