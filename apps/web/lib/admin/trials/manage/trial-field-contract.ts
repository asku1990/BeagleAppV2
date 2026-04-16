import type { AdminTrialDetails } from "@beagle/contracts";

// Locks the AJOK future-poytakirja field contract for current TrialResult read-path planning.
// This is the machine-readable source for status classification and gate-required field sets.
export const AJOK_FIELD_CONTRACT_VERSION = "v2026-04-14";

export type TrialFieldContractGroup =
  | "event"
  | "dog"
  | "result"
  | "conditions"
  | "status"
  | "additional"
  | "judges";

export type TrialFieldContractStatus = "typed-now" | "raw-only" | "missing";

export type TrialFieldFollowUpTicket = "BEJ-79" | "BEJ-80" | "BEJ-82";

type TrialFieldContractBase = {
  group: TrialFieldContractGroup;
  targetField: string;
  followUpTicket: TrialFieldFollowUpTicket | null;
};

export type TrialFieldContractItem =
  | (TrialFieldContractBase & {
      status: "typed-now";
      sourceField: keyof AdminTrialDetails;
    })
  | (TrialFieldContractBase & {
      status: "raw-only" | "missing";
      sourceField: null;
    });

export type TrialFieldContractStatusCounts = Record<
  TrialFieldContractStatus,
  number
>;

export const AJOK_MINIMUM_PRE_SWITCH_FIELDS: readonly string[] = [
  "koepaiva",
  "koekunta",
  "koiranNimi",
  "rekisterinumero",
  "loppupisteet",
  "palkinto",
  "sijoitus",
  "hakuKeskiarvo",
  "haukkuKeskiarvo",
  "hakuloysyysTappioYhteensa",
  "ajoloysyysTappioYhteensa",
  "keli",
  "ryhmatuomariNimi",
] as const;

// Source of truth for the AJOK future-poytakirja field contract.
export const TRIAL_FIELD_CONTRACT_CATALOG: readonly TrialFieldContractItem[] = [
  {
    group: "event",
    targetField: "sklKoeId",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "event",
    targetField: "rotukoodi",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "event",
    targetField: "kennelpiiri",
    status: "typed-now",
    sourceField: "kennelDistrict",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "kennelpiirinro",
    status: "typed-now",
    sourceField: "kennelDistrictNo",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "koekunta",
    status: "typed-now",
    sourceField: "eventPlace",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "koepaiva",
    status: "typed-now",
    sourceField: "eventDate",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "jarjestaja",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "event",
    targetField: "koemuoto",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "koiranNimi",
    status: "typed-now",
    sourceField: "dogName",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "rekisterinumero",
    status: "typed-now",
    sourceField: "registrationNo",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "isanNimi",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "isanRekisterinumero",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "emanNimi",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "emanRekisterinumero",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "omistaja",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "omistajanKotikunta",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "sukupuoli",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "dog",
    targetField: "rokotusOk",
    status: "typed-now",
    sourceField: "rokotusOk",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "tunnistusOk",
    status: "typed-now",
    sourceField: "tunnistusOk",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "era1Alkoi",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "era2Alkoi",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "hakuMin1",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "hakuMin2",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "ajoMin1",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "ajoMin2",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "hyvaksytytAjominuutit",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "ajoajanPisteet",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "hakuKeskiarvo",
    status: "typed-now",
    sourceField: "hakuKeskiarvo",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "haukkuKeskiarvo",
    status: "typed-now",
    sourceField: "haukkuKeskiarvo",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ajotaitoKeskiarvo",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "ansiopisteetYhteensa",
    status: "typed-now",
    sourceField: "loppupisteet",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "hakuloysyysTappioYhteensa",
    status: "typed-now",
    sourceField: "hakuloysyysTappioYhteensa",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ajoloysyysTappioYhteensa",
    status: "typed-now",
    sourceField: "ajoloysyysTappioYhteensa",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "tappiopisteetYhteensa",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "result",
    targetField: "loppupisteet",
    status: "typed-now",
    sourceField: "loppupisteet",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "palkinto",
    status: "typed-now",
    sourceField: "palkinto",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "sijoitus",
    status: "typed-now",
    sourceField: "sijoitus",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "koiriaLuokassa",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "conditions",
    targetField: "keli",
    status: "typed-now",
    sourceField: "keli",
    followUpTicket: null,
  },
  {
    group: "conditions",
    targetField: "paljasMaa",
    status: "typed-now",
    sourceField: "paljasMaa",
    followUpTicket: null,
  },
  {
    group: "conditions",
    targetField: "lumikeli",
    status: "typed-now",
    sourceField: "lumikeli",
    followUpTicket: null,
  },
  {
    group: "status",
    targetField: "luopui",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "status",
    targetField: "suljettu",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "status",
    targetField: "keskeytetty",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "status",
    targetField: "huomautusTeksti",
    status: "missing",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "additional",
    targetField: "lisatiedotJson",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-80",
  },
  {
    group: "judges",
    targetField: "ryhmatuomariNimi",
    status: "typed-now",
    sourceField: "ylituomariNimi",
    followUpTicket: null,
  },
  {
    group: "judges",
    targetField: "palkintotuomariNimi",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "judges",
    targetField: "ylituomariNimi",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
  {
    group: "judges",
    targetField: "ylituomariNumero",
    status: "raw-only",
    sourceField: null,
    followUpTicket: "BEJ-79",
  },
] as const;

export function countTrialFieldContractStatuses(
  catalog: readonly TrialFieldContractItem[] = TRIAL_FIELD_CONTRACT_CATALOG,
): TrialFieldContractStatusCounts {
  const counts: TrialFieldContractStatusCounts = {
    "typed-now": 0,
    "raw-only": 0,
    missing: 0,
  };

  for (const item of catalog) {
    counts[item.status] += 1;
  }

  return counts;
}

export function findTrialFieldContractItem(
  targetField: string,
  catalog: readonly TrialFieldContractItem[] = TRIAL_FIELD_CONTRACT_CATALOG,
): TrialFieldContractItem | undefined {
  return catalog.find((item) => item.targetField === targetField);
}
