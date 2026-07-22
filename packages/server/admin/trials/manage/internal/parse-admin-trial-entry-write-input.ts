import type { AdminTrialEntryWriteData } from "@beagle/contracts";
import type { AdminTrialEntryWriteDataDb } from "@beagle/db";

export type AdminTrialEntryWriteValidationReason =
  | "invalid_koetyyppi"
  | "invalid_huomautus"
  | "invalid_entry_integer"
  | "invalid_entry_number"
  | "missing_eras"
  | "invalid_era_number"
  | "duplicate_eras"
  | "non_continuous_eras"
  | "invalid_era_integer"
  | "invalid_era_number_field"
  | "invalid_lisatieto_code"
  | "duplicate_lisatieto_key"
  | "invalid_lisatieto_era"
  | "duplicate_lisatieto_era_value"
  | "invalid_lisatieto_order";

export type AdminTrialEntryWriteValidationIssue = {
  area: "entry" | "eras" | "additional_info";
  reason: AdminTrialEntryWriteValidationReason;
  value?: string;
};

const VALID_KOETYYPIT = new Set(["NORMAL", "KOKOKAUDENKOE", "PITKAKOE"]);
const VALID_HUOMAUTUKSET = new Set(["LUOPUI", "SULJETTU", "KESKEYTETTY"]);

function normalizeNullableText(
  value: string | null | undefined,
): string | null {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

function normalizeNullableInteger(
  value: number | null | undefined,
): number | null {
  return value == null || !Number.isInteger(value) ? null : value;
}

function normalizeNullableNumber(
  value: number | null | undefined,
): number | null {
  return value == null || !Number.isFinite(value) ? null : value;
}

function isNullableInteger(value: unknown): boolean {
  return (
    value == null || (typeof value === "number" && Number.isSafeInteger(value))
  );
}

function isNullableNumber(value: unknown): boolean {
  return value == null || (typeof value === "number" && Number.isFinite(value));
}

function failure(
  area: AdminTrialEntryWriteValidationIssue["area"],
  reason: AdminTrialEntryWriteValidationReason,
  value?: string,
): { ok: false; issue: AdminTrialEntryWriteValidationIssue } {
  return { ok: false, issue: { area, reason, ...(value ? { value } : {}) } };
}

// Validates and normalizes the result shape shared by create and update writes.
export function parseAdminTrialEntryWriteInput(
  input: AdminTrialEntryWriteData,
  options: { mode: "create" | "update" },
):
  | { ok: true; data: AdminTrialEntryWriteDataDb }
  | { ok: false; issue: AdminTrialEntryWriteValidationIssue } {
  if (!VALID_KOETYYPIT.has(input.entry.koetyyppi)) {
    return failure("entry", "invalid_koetyyppi");
  }
  if (
    input.entry.huomautus != null &&
    !VALID_HUOMAUTUKSET.has(input.entry.huomautus)
  ) {
    return failure("entry", "invalid_huomautus");
  }
  if (
    ![input.entry.koiriaLuokassa, input.entry.hyvaksytytAjominuutit].every(
      isNullableInteger,
    )
  ) {
    return failure("entry", "invalid_entry_integer");
  }
  if (
    ![
      input.entry.points,
      input.entry.ajoajanPisteet,
      input.entry.haku,
      input.entry.hauk,
      input.entry.yva,
      input.entry.hlo,
      input.entry.alo,
      input.entry.tja,
      input.entry.pin,
      input.entry.ansiopisteetYhteensa,
      input.entry.tappiopisteetYhteensa,
    ].every(isNullableNumber)
  ) {
    return failure("entry", "invalid_entry_number");
  }

  if (input.eras.length === 0) {
    return failure("eras", "missing_eras");
  }
  const eraNumbers = input.eras.map((era) => era.era);
  if (
    eraNumbers.some(
      (era) => !Number.isSafeInteger(era) || !Number.isFinite(era) || era < 1,
    )
  ) {
    return failure("eras", "invalid_era_number");
  }
  if (new Set(eraNumbers).size !== eraNumbers.length) {
    return failure("eras", "duplicate_eras");
  }
  const sortedEras = [...eraNumbers].sort((left, right) => left - right);
  if (sortedEras.some((era, index) => era !== index + 1)) {
    return failure("eras", "non_continuous_eras");
  }
  for (const era of input.eras) {
    if (![era.hakumin, era.ajomin].every(isNullableInteger)) {
      return failure("eras", "invalid_era_integer");
    }
    if (
      ![era.haku, era.hauk, era.yva, era.hlo, era.alo, era.tja, era.pin].every(
        isNullableNumber,
      )
    ) {
      return failure("eras", "invalid_era_number_field");
    }
  }

  const lisatietoKeys = new Set<string>();
  for (const row of input.lisatiedotRows) {
    const koodi = normalizeNullableText(row.koodi);
    if (!koodi || !/^[1-9]\d*$/u.test(koodi)) {
      return failure("additional_info", "invalid_lisatieto_code", row.koodi);
    }
    const osa = normalizeNullableText(row.osa) ?? "";
    const key = JSON.stringify([koodi, osa]);
    if (lisatietoKeys.has(key)) {
      return failure("additional_info", "duplicate_lisatieto_key");
    }
    lisatietoKeys.add(key);
    if (options.mode === "create" && !isNullableInteger(row.jarjestys)) {
      return failure("additional_info", "invalid_lisatieto_order");
    }
    if (row.eraValues.some((value) => !eraNumbers.includes(value.era))) {
      return failure("additional_info", "invalid_lisatieto_era");
    }
    const lisatietoEraNumbers = row.eraValues.map((value) => value.era);
    if (new Set(lisatietoEraNumbers).size !== lisatietoEraNumbers.length) {
      return failure("additional_info", "duplicate_lisatieto_era_value");
    }
  }

  return {
    ok: true,
    data: {
      entry: {
        koemaasto: normalizeNullableText(input.entry.koemaasto),
        koemuoto: normalizeNullableText(input.entry.koemuoto),
        koetyyppi: input.entry.koetyyppi,
        ke: normalizeNullableText(input.entry.ke),
        lk: normalizeNullableText(input.entry.lk),
        award: normalizeNullableText(input.entry.award),
        rank: normalizeNullableText(input.entry.rank),
        points: normalizeNullableNumber(input.entry.points),
        koiriaLuokassa: normalizeNullableInteger(input.entry.koiriaLuokassa),
        hyvaksytytAjominuutit: normalizeNullableInteger(
          input.entry.hyvaksytytAjominuutit,
        ),
        ajoajanPisteet: normalizeNullableNumber(input.entry.ajoajanPisteet),
        haku: normalizeNullableNumber(input.entry.haku),
        hauk: normalizeNullableNumber(input.entry.hauk),
        yva: normalizeNullableNumber(input.entry.yva),
        hlo: normalizeNullableNumber(input.entry.hlo),
        alo: normalizeNullableNumber(input.entry.alo),
        tja: normalizeNullableNumber(input.entry.tja),
        pin: normalizeNullableNumber(input.entry.pin),
        ansiopisteetYhteensa: normalizeNullableNumber(
          input.entry.ansiopisteetYhteensa,
        ),
        tappiopisteetYhteensa: normalizeNullableNumber(
          input.entry.tappiopisteetYhteensa,
        ),
        judge: normalizeNullableText(input.entry.judge),
        huomautus: input.entry.huomautus ?? null,
        huomautusTeksti: normalizeNullableText(input.entry.huomautusTeksti),
        ylituomariNumeroSnapshot: normalizeNullableText(
          input.entry.ylituomariNumeroSnapshot,
        ),
        ryhmatuomariNimi: normalizeNullableText(input.entry.ryhmatuomariNimi),
        palkintotuomariNimi: normalizeNullableText(
          input.entry.palkintotuomariNimi,
        ),
        omistajaSnapshot: normalizeNullableText(input.entry.omistajaSnapshot),
        omistajanKotikuntaSnapshot: normalizeNullableText(
          input.entry.omistajanKotikuntaSnapshot,
        ),
      },
      eras: input.eras.map((era) => ({
        era: era.era,
        alkoi: normalizeNullableText(era.alkoi),
        hakumin: normalizeNullableInteger(era.hakumin),
        ajomin: normalizeNullableInteger(era.ajomin),
        haku: normalizeNullableNumber(era.haku),
        hauk: normalizeNullableNumber(era.hauk),
        yva: normalizeNullableNumber(era.yva),
        hlo: normalizeNullableNumber(era.hlo),
        alo: normalizeNullableNumber(era.alo),
        tja: normalizeNullableNumber(era.tja),
        pin: normalizeNullableNumber(era.pin),
        huomautusTeksti: normalizeNullableText(era.huomautusTeksti),
      })),
      lisatiedotByEra: eraNumbers.map((era) => ({
        era,
        replaceKeys: input.lisatiedotRows.map((row) => ({
          koodi: normalizeNullableText(row.koodi) ?? row.koodi,
          osa: normalizeNullableText(row.osa) ?? "",
        })),
        items: input.lisatiedotRows.flatMap((row) => {
          const arvo = normalizeNullableText(
            row.eraValues.find((value) => value.era === era)?.arvo,
          );
          return arvo
            ? [
                {
                  koodi: normalizeNullableText(row.koodi) ?? row.koodi,
                  osa: normalizeNullableText(row.osa) ?? "",
                  arvo,
                  nimi: normalizeNullableText(row.nimi),
                  jarjestys: normalizeNullableInteger(row.jarjestys),
                },
              ]
            : [];
        }),
      })),
    },
  };
}
