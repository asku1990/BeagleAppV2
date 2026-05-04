export type AdminTrialEventSearchSortDb = "date-desc" | "date-asc";

export type AdminTrialEventSearchRequestDb = {
  query?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: AdminTrialEventSearchSortDb;
};

export type AdminTrialEventSummaryDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  eventName: string | null;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
  dogCount: number;
};

export type AdminTrialEventSearchResponseDb = {
  availableEventDates: Date[];
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialEventSummaryDb[];
};

export type AdminTrialEventDetailsRequestDb = {
  trialEventId: string;
};

export type AdminTrialEventEntryDb = {
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
  koemaasto: string | null;
  koiriaLuokassa: number | null;
  ke: string | null;
  lk: string | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  ansiopisteetYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
  huomautus: "LUOPUI" | "SULJETTU" | "KESKEYTETTY" | null;
  huomautusTeksti: string | null;
  ylituomariNimiSnapshot: string | null;
  ylituomariNumeroSnapshot: string | null;
  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
  omistajaSnapshot: string | null;
  omistajanKotikuntaSnapshot: string | null;
  eras: AdminTrialEntryEraDb[];
};

export type AdminTrialEntryEraDb = {
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
  lisatiedot: AdminTrialEntryEraLisatietoDb[];
};

export type AdminTrialEntryEraLisatietoDb = {
  koodi: string;
  osa: string;
  arvo: string;
  nimi: string | null;
  jarjestys: number | null;
};

export type AdminTrialEventDetailsDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  eventName: string | null;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
  entries: AdminTrialEventEntryDb[];
};
