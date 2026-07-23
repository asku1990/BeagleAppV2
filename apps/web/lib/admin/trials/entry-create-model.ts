import type {
  AdminTrialEventDetails,
  AdminTrialEventEntry,
  CreateAdminTrialEntryRequest,
} from "@beagle/contracts";
import {
  createEmptyEraDraft,
  isValidOptionalDecimal,
  isValidOptionalInteger,
  parseDecimal,
  parseInteger,
  parseNullableString,
  toEntryDraft,
  toLisatietoRows,
  type EntryDraft,
  type EraDraft,
  type LisatietoRowDraft,
} from "./entry-edit-dialog-model";

export type AdminTrialEntryCreateDraft = {
  registrationNo: string;
  entry: EntryDraft;
  eras: EraDraft[];
  lisatiedotRows: LisatietoRowDraft[];
};

export type AdminTrialEntryCreateValidation =
  | { ok: true; request: CreateAdminTrialEntryRequest }
  | { ok: false; section: "registration" | "entry" | "eras" };

function emptyEntry(event: AdminTrialEventDetails): AdminTrialEventEntry {
  return {
    trialId: "",
    dogId: null,
    dogName: "",
    registrationNo: null,
    entryKey: "",
    koemuoto: null,
    koetyyppi: "NORMAL",
    rank: null,
    award: null,
    points: null,
    judge: event.ylituomari,
    ylituomariNumeroSnapshot: event.ylituomariNumero,
    eras: [],
  };
}

export function createAdminTrialEntryCreateDraft(
  event: AdminTrialEventDetails,
): AdminTrialEntryCreateDraft {
  const entry = emptyEntry(event);
  const eras = [createEmptyEraDraft(1)];
  return {
    registrationNo: "",
    entry: toEntryDraft(entry),
    eras,
    lisatiedotRows: toLisatietoRows(entry, eras),
  };
}

export function areAdminTrialEntryCreateDraftsEqual(
  left: AdminTrialEntryCreateDraft,
  right: AdminTrialEntryCreateDraft,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function toCreateAdminTrialEntryRequest(
  trialEventId: string,
  draft: AdminTrialEntryCreateDraft,
): AdminTrialEntryCreateValidation {
  if (!draft.registrationNo.trim())
    return { ok: false, section: "registration" };
  const integerValues = [
    draft.entry.koiriaLuokassa,
    draft.entry.hyvaksytytAjominuutit,
  ];
  const decimalValues = [
    draft.entry.points,
    draft.entry.ajoajanPisteet,
    draft.entry.haku,
    draft.entry.hauk,
    draft.entry.yva,
    draft.entry.hlo,
    draft.entry.alo,
    draft.entry.tja,
    draft.entry.pin,
    draft.entry.ansiopisteetYhteensa,
    draft.entry.tappiopisteetYhteensa,
  ];
  if (
    integerValues.some((value) => !isValidOptionalInteger(value)) ||
    decimalValues.some((value) => !isValidOptionalDecimal(value))
  ) {
    return { ok: false, section: "entry" };
  }
  const eras = [...draft.eras].sort((a, b) => a.era - b.era);
  if (
    !eras.length ||
    eras.some(
      (era, index) =>
        era.era !== index + 1 ||
        !isValidOptionalInteger(era.hakumin) ||
        !isValidOptionalInteger(era.ajomin) ||
        [era.haku, era.hauk, era.yva, era.hlo, era.alo, era.tja, era.pin].some(
          (value) => !isValidOptionalDecimal(value),
        ),
    )
  ) {
    return { ok: false, section: "eras" };
  }
  const entry = draft.entry;
  return {
    ok: true,
    request: {
      trialEventId,
      registrationNo: draft.registrationNo.trim(),
      entry: {
        koemaasto: parseNullableString(entry.koemaasto),
        koemuoto: parseNullableString(entry.koemuoto),
        koetyyppi: entry.koetyyppi,
        ke: parseNullableString(entry.ke),
        lk: parseNullableString(entry.lk),
        award: parseNullableString(entry.award),
        rank: parseNullableString(entry.rank),
        points: parseDecimal(entry.points),
        koiriaLuokassa: parseInteger(entry.koiriaLuokassa),
        hyvaksytytAjominuutit: parseInteger(entry.hyvaksytytAjominuutit),
        ajoajanPisteet: parseDecimal(entry.ajoajanPisteet),
        haku: parseDecimal(entry.haku),
        hauk: parseDecimal(entry.hauk),
        yva: parseDecimal(entry.yva),
        hlo: parseDecimal(entry.hlo),
        alo: parseDecimal(entry.alo),
        tja: parseDecimal(entry.tja),
        pin: parseDecimal(entry.pin),
        ansiopisteetYhteensa: parseDecimal(entry.ansiopisteetYhteensa),
        tappiopisteetYhteensa: parseDecimal(entry.tappiopisteetYhteensa),
        judge: parseNullableString(entry.judge),
        huomautus: entry.huomautus || null,
        huomautusTeksti: parseNullableString(entry.huomautusTeksti),
        ylituomariNumeroSnapshot: parseNullableString(
          entry.ylituomariNumeroSnapshot,
        ),
        ryhmatuomariNimi: parseNullableString(entry.ryhmatuomariNimi),
        palkintotuomariNimi: parseNullableString(entry.palkintotuomariNimi),
        omistajaSnapshot: parseNullableString(entry.omistajaSnapshot),
        omistajanKotikuntaSnapshot: parseNullableString(
          entry.omistajanKotikuntaSnapshot,
        ),
      },
      eras: eras.map((era) => ({
        era: era.era,
        alkoi: parseNullableString(era.alkoi),
        hakumin: parseInteger(era.hakumin),
        ajomin: parseInteger(era.ajomin),
        haku: parseDecimal(era.haku),
        hauk: parseDecimal(era.hauk),
        yva: parseDecimal(era.yva),
        hlo: parseDecimal(era.hlo),
        alo: parseDecimal(era.alo),
        tja: parseDecimal(era.tja),
        pin: parseDecimal(era.pin),
        huomautusTeksti: parseNullableString(era.huomautusTeksti),
      })),
      lisatiedotRows: draft.lisatiedotRows
        .filter((row) =>
          eras.some((era) => (row.eraValues[era.era] ?? "").trim().length > 0),
        )
        .map((row) => ({
          koodi: row.koodi,
          osa: row.osa,
          nimi: row.nimi,
          jarjestys: row.jarjestys,
          eraValues: eras.map((era) => ({
            era: era.era,
            arvo: parseNullableString(row.eraValues[era.era] ?? ""),
          })),
        })),
    },
  };
}
