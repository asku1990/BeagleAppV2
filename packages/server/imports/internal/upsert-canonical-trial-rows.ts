import {
  type LegacyTrialResultRow,
  upsertTrialEntryByEventAndRegistrationDb,
  upsertTrialEventByLegacyKeyDb,
} from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { toTrialLegacyEventKey } from "./trial-event-identity-key";

// Maps legacy akoeall rows into canonical AJOK TrialEvent and TrialEntry writes.
// Owns row validation, legacy-field normalization, and import issue reporting.
function parseLegacyScore(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseLegacyFlags(flag: string | null): {
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
} {
  const normalized = normalizeNullable(flag)?.toUpperCase();
  if (!normalized || normalized === "NUL" || normalized === "NULL") {
    return { luopui: null, suljettu: null, keskeytetty: null };
  }

  if (!/[LSK]/.test(normalized)) {
    return { luopui: null, suljettu: null, keskeytetty: null };
  }

  return {
    luopui: normalized.includes("L"),
    suljettu: normalized.includes("S"),
    keskeytetty: normalized.includes("K"),
  };
}

export type CanonicalTrialUpsertIssue = {
  severity: "INFO" | "WARNING";
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string;
  payloadJson: string;
};

export type CanonicalTrialUpsertResult = {
  upserted: number;
  errors: number;
  issues: CanonicalTrialUpsertIssue[];
};

// Maps akoeall rows to canonical AJOK TrialEvent/TrialEntry records.
export async function upsertCanonicalTrialRows(
  rows: LegacyTrialResultRow[],
  dogIdByRegistration: Map<string, string>,
  options?: {
    onProgress?: (processed: number, total: number) => void;
  },
): Promise<CanonicalTrialUpsertResult> {
  const total = rows.length;
  const sourceTable = "akoeall";
  let processed = 0;
  let upserted = 0;
  let errors = 0;
  const issues: CanonicalTrialUpsertIssue[] = [];
  const judgeByEventKey = new Map<string, string>();

  for (const row of rows) {
    processed += 1;
    const registrationNo = normalizeRegistrationNo(row.registrationNo);
    if (!registrationNo || !isValidRegistrationNo(registrationNo)) {
      errors += 1;
      issues.push({
        severity: "WARNING",
        code: "TRIAL_CANONICAL_REGISTRATION_INVALID_FORMAT",
        message:
          "Canonical trial row skipped because registration number format is invalid.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const koepaiva = parseLegacyDate(row.eventDateRaw);
    const koekunta = normalizeNullable(row.eventPlace);
    if (!koepaiva || !koekunta) {
      errors += 1;
      issues.push({
        severity: "WARNING",
        code: "TRIAL_CANONICAL_MISSING_REQUIRED_FIELDS",
        message:
          "Canonical trial row skipped because event date or event place is missing.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const kennelpiiri = normalizeNullable(row.kennelDistrict);
    const kennelpiirinro = normalizeNullable(row.kennelDistrictNo);
    const legacyEventKey = toTrialLegacyEventKey({
      koepaiva,
      koekunta,
      kennelpiiri,
      kennelpiirinro,
    });
    const flags = parseLegacyFlags(row.legacyFlag);
    const payloadJson = JSON.stringify(row);
    const incomingJudge = normalizeNullable(row.judge);
    const existingJudge = judgeByEventKey.get(legacyEventKey) ?? null;
    let judgeForEvent: string | null = incomingJudge;

    // Multiple akoeall rows can belong to the same event. A null judge on a
    // later row must not erase a judge that was already established earlier in
    // the same phase2 pass.
    if (existingJudge) {
      if (incomingJudge && incomingJudge !== existingJudge) {
        errors += 1;
        issues.push({
          severity: "WARNING",
          code: "TRIAL_CANONICAL_JUDGE_CONFLICT",
          message:
            "Canonical trial row has a different judge than the one already recorded for this event; the first non-null judge is kept.",
          registrationNo,
          sourceTable,
          payloadJson: JSON.stringify({
            legacyEventKey,
            existingJudge,
            incomingJudge,
            registrationNo: row.registrationNo,
            eventPlace: row.eventPlace,
            eventDateRaw: row.eventDateRaw,
          }),
        });
      }
      judgeForEvent = existingJudge;
    } else if (incomingJudge) {
      judgeByEventKey.set(legacyEventKey, incomingJudge);
    }

    const trialEvent = await upsertTrialEventByLegacyKeyDb({
      legacyEventKey,
      koepaiva,
      koekunta,
      kennelpiiri,
      kennelpiirinro,
      ylituomariNimi: judgeForEvent,
    });

    const yksilointiAvain = `${legacyEventKey}|${registrationNo}`;
    const dogId = dogIdByRegistration.get(registrationNo) ?? null;
    // Missing dog matches are tracked as issues, but the row still carries a
    // nullable dog link so the import does not invent an association.
    if (!dogId) {
      issues.push({
        severity: "WARNING",
        code: "TRIAL_CANONICAL_DOG_NOT_FOUND",
        message:
          "Canonical trial row imported without a dog link because no matching registration was found in DogRegistration.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
    }
    await upsertTrialEntryByEventAndRegistrationDb({
      trialEventId: trialEvent.id,
      dogId,
      rekisterinumeroSnapshot: registrationNo,
      yksilointiAvain,
      raakadataJson: payloadJson,
      palkinto: normalizeNullable(row.pa),
      sijoitus: normalizeNullable(row.sija),
      loppupisteet: parseLegacyScore(row.piste),
      hakuKeskiarvo: parseLegacyScore(row.haku),
      haukkuKeskiarvo: parseLegacyScore(row.hauk),
      hakuloysyysTappioYhteensa: parseLegacyScore(row.hlo),
      ajoloysyysTappioYhteensa: parseLegacyScore(row.alo),
      keli: normalizeNullable(row.ke),
      luopui: flags.luopui,
      suljettu: flags.suljettu,
      keskeytetty: flags.keskeytetty,
      notes: normalizeNullable(row.legacyFlag),
    });

    if (
      normalizeNullable(String(row.yva ?? "")) ||
      normalizeNullable(String(row.tja ?? "")) ||
      normalizeNullable(String(row.pin ?? ""))
    ) {
      issues.push({
        severity: "INFO",
        code: "TRIAL_CANONICAL_UNMAPPED_FIELDS",
        message:
          "Some legacy trial metrics are not yet mapped to canonical entry fields (YVA/TJA/PIN).",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          yva: row.yva,
          tja: row.tja,
          pin: row.pin,
        }),
      });
    }

    upserted += 1;

    if (processed % 1000 === 0) {
      options?.onProgress?.(processed, total);
    }
  }

  options?.onProgress?.(processed, total);

  return {
    upserted,
    errors,
    issues,
  };
}
