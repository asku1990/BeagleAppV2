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
    status: "typed-now",
    sourceField: "sklKoeId",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "rotukoodi",
    status: "typed-now",
    sourceField: "rotukoodi",
    followUpTicket: null,
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
    status: "typed-now",
    sourceField: "jarjestaja",
    followUpTicket: null,
  },
  {
    group: "event",
    targetField: "koemuoto",
    status: "typed-now",
    sourceField: "koemuoto",
    followUpTicket: null,
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
    status: "typed-now",
    sourceField: "isanNimi",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "isanRekisterinumero",
    status: "typed-now",
    sourceField: "isanRekisterinumero",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "emanNimi",
    status: "typed-now",
    sourceField: "emanNimi",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "emanRekisterinumero",
    status: "typed-now",
    sourceField: "emanRekisterinumero",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "omistaja",
    status: "typed-now",
    sourceField: "omistaja",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "omistajanKotikunta",
    status: "typed-now",
    sourceField: "omistajanKotikunta",
    followUpTicket: null,
  },
  {
    group: "dog",
    targetField: "sukupuoli",
    status: "typed-now",
    sourceField: "sukupuoli",
    followUpTicket: null,
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
    status: "typed-now",
    sourceField: "era1Alkoi",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "era2Alkoi",
    status: "typed-now",
    sourceField: "era2Alkoi",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "hakuMin1",
    status: "typed-now",
    sourceField: "hakuMin1",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "hakuMin2",
    status: "typed-now",
    sourceField: "hakuMin2",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ajoMin1",
    status: "typed-now",
    sourceField: "ajoMin1",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ajoMin2",
    status: "typed-now",
    sourceField: "ajoMin2",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "hyvaksytytAjominuutit",
    status: "typed-now",
    sourceField: "hyvaksytytAjominuutit",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ajoajanPisteet",
    status: "typed-now",
    sourceField: "ajoajanPisteet",
    followUpTicket: null,
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
    status: "typed-now",
    sourceField: "ajotaitoKeskiarvo",
    followUpTicket: null,
  },
  {
    group: "result",
    targetField: "ansiopisteetYhteensa",
    status: "typed-now",
    sourceField: "ansiopisteetYhteensa",
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
    status: "typed-now",
    sourceField: "tappiopisteetYhteensa",
    followUpTicket: null,
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
    status: "typed-now",
    sourceField: "koiriaLuokassa",
    followUpTicket: null,
  },
  {
    group: "conditions",
    targetField: "keli",
    status: "typed-now",
    sourceField: "keli",
    followUpTicket: null,
  },
  {
    group: "status",
    targetField: "luopui",
    status: "typed-now",
    sourceField: "luopui",
    followUpTicket: null,
  },
  {
    group: "status",
    targetField: "suljettu",
    status: "typed-now",
    sourceField: "suljettu",
    followUpTicket: null,
  },
  {
    group: "status",
    targetField: "keskeytetty",
    status: "typed-now",
    sourceField: "keskeytetty",
    followUpTicket: null,
  },
  {
    group: "status",
    targetField: "huomautusTeksti",
    status: "typed-now",
    sourceField: "huomautusTeksti",
    followUpTicket: null,
  },
  {
    group: "additional",
    targetField: "lisatiedotJson",
    status: "typed-now",
    sourceField: "lisatiedotJson",
    followUpTicket: null,
  },
  {
    group: "judges",
    targetField: "ryhmatuomariNimi",
    status: "typed-now",
    sourceField: "ryhmatuomariNimi",
    followUpTicket: null,
  },
  {
    group: "judges",
    targetField: "palkintotuomariNimi",
    status: "typed-now",
    sourceField: "palkintotuomariNimi",
    followUpTicket: null,
  },
  {
    group: "judges",
    targetField: "ylituomariNimi",
    status: "typed-now",
    sourceField: "ylituomariNimi",
    followUpTicket: null,
  },
  {
    group: "judges",
    targetField: "ylituomariNumero",
    status: "typed-now",
    sourceField: "ylituomariNumero",
    followUpTicket: null,
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
