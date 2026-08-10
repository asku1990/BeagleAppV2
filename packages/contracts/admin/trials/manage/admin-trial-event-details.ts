import type { AdminTrialEventSummary } from "./admin-trials-list";

export type AdminTrialEventDetailsRequest = {
  trialEventId: string;
};

export type AdminTrialEventEntry = {
  trialId: string;
  dogId: string | null;
  dogName: string;
  registrationNo: string | null;
  entryKey: string;
  koemuoto: string | null;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  rank: string | null;
  award: string | null;
  points: number | null;
  judge: string | null;
  koemaasto?: string | null;
  koiriaLuokassa?: number | null;
  ke?: string | null;
  lk?: string | null;
  hyvaksytytAjominuutit?: number | null;
  ajoajanPisteet?: number | null;
  haku?: number | null;
  hauk?: number | null;
  yva?: number | null;
  hlo?: number | null;
  alo?: number | null;
  tja?: number | null;
  pin?: number | null;
  ansiopisteetYhteensa?: number | null;
  tappiopisteetYhteensa?: number | null;
  huomautus?: "LUOPUI" | "SULJETTU" | "KESKEYTETTY" | null;
  huomautusTeksti?: string | null;
  ylituomariNumeroSnapshot?: string | null;
  ryhmatuomariNimi?: string | null;
  palkintotuomariNimi?: string | null;
  omistajaSnapshot?: string | null;
  omistajanKotikuntaSnapshot?: string | null;
  eras?: AdminTrialEntryEra[];
};

export type AdminTrialEntryEra = {
  era: number;
  alkoi: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  huomautusTeksti: string | null;
  lisatiedot: AdminTrialEntryEraLisatieto[];
};

export type AdminTrialEntryEraLisatieto = {
  koodi: string;
  osa: string;
  arvo: string;
  nimi: string | null;
  jarjestys: number | null;
};

export type AdminTrialEventDetails = AdminTrialEventSummary & {
  trialRuleWindowId: string | null;
  entries: AdminTrialEventEntry[];
};

export type AdminTrialEventDetailsResponse = {
  event: AdminTrialEventDetails;
};
