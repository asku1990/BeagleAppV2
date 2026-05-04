import type { AdminTrialEventEntry } from "@beagle/contracts";
import { ADMIN_TRIAL_LISATIETO_KOODIT } from "./entry-edit-config";

export type LisatietoRowDraft = {
  koodi: string;
  eraValues: Record<number, string>;
};

export type EraDraft = {
  era: number;
  alkoi: string;
  hakumin: string;
  ajomin: string;
  haku: string;
  hauk: string;
  yva: string;
  hlo: string;
  alo: string;
  tja: string;
  pin: string;
  huomautusTeksti: string;
};

export type EntryDraft = {
  koemaasto: string;
  koemuoto: string;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  ke: string;
  lk: string;
  award: string;
  rank: string;
  points: string;
  koiriaLuokassa: string;
  hyvaksytytAjominuutit: string;
  ajoajanPisteet: string;
  haku: string;
  hauk: string;
  yva: string;
  hlo: string;
  alo: string;
  tja: string;
  pin: string;
  ansiopisteetYhteensa: string;
  tappiopisteetYhteensa: string;
  judge: string;
  huomautus: "" | "LUOPUI" | "SULJETTU" | "KESKEYTETTY";
  huomautusTeksti: string;
  ylituomariNimiSnapshot: string;
  ylituomariNumeroSnapshot: string;
  ryhmatuomariNimi: string;
  palkintotuomariNimi: string;
  omistajaSnapshot: string;
  omistajanKotikuntaSnapshot: string;
};

export function createEmptyEraDraft(era: number): EraDraft {
  return {
    era,
    alkoi: "",
    hakumin: "",
    ajomin: "",
    haku: "",
    hauk: "",
    yva: "",
    hlo: "",
    alo: "",
    tja: "",
    pin: "",
    huomautusTeksti: "",
  };
}

export function toEntryDraft(entry: AdminTrialEventEntry): EntryDraft {
  return {
    koemaasto: entry.koemaasto ?? "",
    koemuoto: entry.koemuoto ?? "",
    koetyyppi: entry.koetyyppi,
    ke: entry.ke ?? "",
    lk: entry.lk ?? "",
    award: entry.award ?? "",
    rank: entry.rank ?? "",
    points: entry.points === null ? "" : String(entry.points),
    koiriaLuokassa:
      entry.koiriaLuokassa === null ? "" : String(entry.koiriaLuokassa),
    hyvaksytytAjominuutit:
      entry.hyvaksytytAjominuutit === null
        ? ""
        : String(entry.hyvaksytytAjominuutit),
    ajoajanPisteet:
      entry.ajoajanPisteet === null ? "" : String(entry.ajoajanPisteet),
    haku: entry.haku === null ? "" : String(entry.haku),
    hauk: entry.hauk === null ? "" : String(entry.hauk),
    yva: entry.yva === null ? "" : String(entry.yva),
    hlo: entry.hlo === null ? "" : String(entry.hlo),
    alo: entry.alo === null ? "" : String(entry.alo),
    tja: entry.tja === null ? "" : String(entry.tja),
    pin: entry.pin === null ? "" : String(entry.pin),
    ansiopisteetYhteensa:
      entry.ansiopisteetYhteensa === null
        ? ""
        : String(entry.ansiopisteetYhteensa),
    tappiopisteetYhteensa:
      entry.tappiopisteetYhteensa === null
        ? ""
        : String(entry.tappiopisteetYhteensa),
    judge: entry.judge ?? "",
    huomautus: entry.huomautus ?? "",
    huomautusTeksti: entry.huomautusTeksti ?? "",
    ylituomariNimiSnapshot: entry.ylituomariNimiSnapshot ?? "",
    ylituomariNumeroSnapshot: entry.ylituomariNumeroSnapshot ?? "",
    ryhmatuomariNimi: entry.ryhmatuomariNimi ?? "",
    palkintotuomariNimi: entry.palkintotuomariNimi ?? "",
    omistajaSnapshot: entry.omistajaSnapshot ?? "",
    omistajanKotikuntaSnapshot: entry.omistajanKotikuntaSnapshot ?? "",
  };
}

export function toEraDrafts(entry: AdminTrialEventEntry): EraDraft[] {
  const mapped = (entry.eras ?? []).map((era) => ({
    era: era.era,
    alkoi: era.alkoi ?? "",
    hakumin: era.hakumin === null ? "" : String(era.hakumin),
    ajomin: era.ajomin === null ? "" : String(era.ajomin),
    haku: era.haku === null ? "" : String(era.haku),
    hauk: era.hauk === null ? "" : String(era.hauk),
    yva: era.yva === null ? "" : String(era.yva),
    hlo: era.hlo === null ? "" : String(era.hlo),
    alo: era.alo === null ? "" : String(era.alo),
    tja: era.tja === null ? "" : String(era.tja),
    pin: era.pin === null ? "" : String(era.pin),
    huomautusTeksti: era.huomautusTeksti ?? "",
  }));

  if (!mapped.some((era) => era.era === 1)) {
    mapped.push(createEmptyEraDraft(1));
  }
  if (!mapped.some((era) => era.era === 2)) {
    mapped.push(createEmptyEraDraft(2));
  }
  return mapped.sort((left, right) => left.era - right.era);
}

export function toLisatietoRows(
  entry: AdminTrialEventEntry,
  eras: EraDraft[],
): LisatietoRowDraft[] {
  const eraNumbers = eras.map((era) => era.era);
  const values = new Map<string, Record<number, string>>();
  for (const code of ADMIN_TRIAL_LISATIETO_KOODIT) {
    const row: Record<number, string> = {};
    for (const era of eraNumbers) {
      row[era] = "";
    }
    values.set(code, row);
  }

  for (const era of entry.eras ?? []) {
    for (const item of era.lisatiedot) {
      const existing = values.get(item.koodi);
      if (!existing) {
        continue;
      }
      existing[era.era] = item.arvo;
    }
  }

  return ADMIN_TRIAL_LISATIETO_KOODIT.map((koodi) => ({
    koodi,
    eraValues: values.get(koodi) ?? {},
  }));
}

export function parseInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

export function parseDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
