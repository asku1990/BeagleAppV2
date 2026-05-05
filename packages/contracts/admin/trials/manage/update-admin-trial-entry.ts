import type {
  AdminTrialEntryEra,
  AdminTrialEventEntry,
} from "./admin-trial-event-details";

export type UpdateAdminTrialEntryLisatietoRow = {
  koodi: string;
  osa: string;
  nimi: string | null;
  jarjestys: number | null;
  eraValues: Array<{
    era: number;
    arvo: string | null;
  }>;
};

export type UpdateAdminTrialEntryRequest = {
  trialEventId: string;
  trialEntryId: string;
  entry: Pick<
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
  eras: Array<Omit<AdminTrialEntryEra, "lisatiedot">>;
  lisatiedotRows: UpdateAdminTrialEntryLisatietoRow[];
};

export type UpdateAdminTrialEntryResponse = {
  trialEventId: string;
  trialEntryId: string;
};
