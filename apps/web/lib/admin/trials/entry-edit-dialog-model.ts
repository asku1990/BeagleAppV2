import type { AdminTrialEventEntry } from "@beagle/contracts";
import {
  ADMIN_TRIAL_LISATIETO_CONFIG,
  getAdminTrialLisatietoConfig,
  type AdminTrialLisatietoGroup,
  type AdminTrialLisatietoInputKind,
} from "./entry-edit-config";

export type LisatietoRowDraft = {
  koodi: string;
  osa: string;
  nimi: string | null;
  jarjestys: number | null;
  group: AdminTrialLisatietoGroup;
  label: string;
  inputKind: AdminTrialLisatietoInputKind;
  sortOrder: number;
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

export function getNextEraNumber(eras: EraDraft[]): number {
  return Math.max(0, ...eras.map((era) => era.era)) + 1;
}

function numberDraft(value: number | null | undefined): string {
  return value == null ? "" : String(value);
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
    points: numberDraft(entry.points),
    koiriaLuokassa: numberDraft(entry.koiriaLuokassa),
    hyvaksytytAjominuutit: numberDraft(entry.hyvaksytytAjominuutit),
    ajoajanPisteet: numberDraft(entry.ajoajanPisteet),
    haku: numberDraft(entry.haku),
    hauk: numberDraft(entry.hauk),
    yva: numberDraft(entry.yva),
    hlo: numberDraft(entry.hlo),
    alo: numberDraft(entry.alo),
    tja: numberDraft(entry.tja),
    pin: numberDraft(entry.pin),
    ansiopisteetYhteensa: numberDraft(entry.ansiopisteetYhteensa),
    tappiopisteetYhteensa: numberDraft(entry.tappiopisteetYhteensa),
    judge: entry.judge ?? "",
    huomautus: entry.huomautus ?? "",
    huomautusTeksti: entry.huomautusTeksti ?? "",
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
  return mapped.sort((left, right) => left.era - right.era);
}

export function toLisatietoRows(
  entry: AdminTrialEventEntry,
  eras: EraDraft[],
): LisatietoRowDraft[] {
  const eraNumbers = eras.map((era) => era.era);
  const values = new Map<string, LisatietoRowDraft>();

  function rowKey(koodi: string, osa: string): string {
    return `${koodi}\u0000${osa}`;
  }

  function createEraValues(): Record<number, string> {
    const row: Record<number, string> = {};
    for (const era of eraNumbers) {
      row[era] = "";
    }
    return row;
  }

  function ensureRow(input: {
    koodi: string;
    osa: string;
    nimi: string | null;
    jarjestys: number | null;
  }): LisatietoRowDraft {
    const key = rowKey(input.koodi, input.osa);
    const existing = values.get(key);
    if (existing) {
      return existing;
    }

    const config = getAdminTrialLisatietoConfig(input.koodi, input.osa);
    const parsedCode = Number.parseInt(input.koodi, 10);
    const row: LisatietoRowDraft = {
      koodi: input.koodi,
      osa: input.osa,
      nimi: input.nimi,
      jarjestys: input.jarjestys,
      group: config?.group ?? "unknown",
      label: config?.label ?? input.nimi ?? "Tuntematon lisätieto",
      inputKind: config?.inputKind ?? "text",
      sortOrder:
        config?.sortOrder ??
        (Number.isInteger(parsedCode) ? parsedCode : Number.MAX_SAFE_INTEGER),
      eraValues: createEraValues(),
    };
    values.set(key, row);
    return row;
  }

  for (const config of ADMIN_TRIAL_LISATIETO_CONFIG) {
    ensureRow({
      koodi: config.koodi,
      osa: config.osa,
      nimi: config.label,
      jarjestys: config.persistenceOrder,
    });
  }

  for (const era of entry.eras ?? []) {
    for (const item of era.lisatiedot) {
      const row = ensureRow({
        koodi: item.koodi,
        osa: item.osa,
        nimi: item.nimi,
        jarjestys: item.jarjestys,
      });
      row.jarjestys = item.jarjestys;
      row.eraValues[era.era] = item.arvo;
    }
  }

  return Array.from(values.values()).sort((left, right) => {
    if (left.group !== right.group) {
      const groupOrder: Record<AdminTrialLisatietoGroup, number> = {
        olosuhteet: 1,
        haku: 2,
        haukku: 3,
        metsastysinto: 4,
        ajo: 5,
        muut_ominaisuudet: 6,
        unknown: 7,
      };
      return groupOrder[left.group] - groupOrder[right.group];
    }
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    if (left.koodi !== right.koodi) {
      return left.koodi.localeCompare(right.koodi, "fi", { numeric: true });
    }
    return left.osa.localeCompare(right.osa, "fi", { numeric: true });
  });
}

const MIN_DB_INTEGER = -2_147_483_648;
const MAX_DB_INTEGER = 2_147_483_647;

export function parseInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^-?\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) &&
    parsed >= MIN_DB_INTEGER &&
    parsed <= MAX_DB_INTEGER
    ? parsed
    : null;
}

export function parseDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export function isValidOptionalInteger(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || parseInteger(trimmed) !== null;
}

export function isValidOptionalDecimal(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return true;
  }
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed);
}

export function parseNullableString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
