import type {
  AdminTrialEntryEra,
  AdminTrialEventEntry,
} from "./admin-trial-event-details";

export type AdminTrialEntryLisatietoWriteRow = {
  koodi: string;
  osa: string;
  nimi: string | null;
  jarjestys: number | null;
  eraValues: Array<{
    era: number;
    arvo: string | null;
  }>;
};

export type AdminTrialEntryWriteFields = Pick<
  AdminTrialEventEntry,
  | "koemaasto"
  | "koemuoto"
  | "koetyyppi"
  | "ke"
  | "lk"
  | "award"
  | "rank"
  | "points"
  | "koiriaLuokassa"
  | "hyvaksytytAjominuutit"
  | "ajoajanPisteet"
  | "haku"
  | "hauk"
  | "yva"
  | "hlo"
  | "alo"
  | "tja"
  | "pin"
  | "ansiopisteetYhteensa"
  | "tappiopisteetYhteensa"
  | "judge"
  | "huomautus"
  | "huomautusTeksti"
  | "ylituomariNumeroSnapshot"
  | "ryhmatuomariNimi"
  | "palkintotuomariNimi"
  | "omistajaSnapshot"
  | "omistajanKotikuntaSnapshot"
>;

export type AdminTrialEntryEraWrite = Omit<AdminTrialEntryEra, "lisatiedot">;

export type AdminTrialEntryWriteData = {
  entry: AdminTrialEntryWriteFields;
  eras: AdminTrialEntryEraWrite[];
  lisatiedotRows: AdminTrialEntryLisatietoWriteRow[];
};
