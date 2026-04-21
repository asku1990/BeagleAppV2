export type AdminTrialEventSearchSortDb = "date-desc" | "date-asc";

export type AdminTrialDetailsRequestDb = {
  trialId: string;
};

export type AdminTrialDetailsDb = {
  trialId: string;
  dogId: string | null;
  dogName: string;
  registrationNo: string | null;
  sklKoeId: number | null;
  entryKey: string;
  eventDate: Date;
  eventName: string | null;
  eventPlace: string;
  rotukoodi: string | null;
  jarjestaja: string | null;
  koemuoto: string | null;
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  ylituomariNumero: string | null;
  keli: string | null;
  luokka: string | null;
  koiriaLuokassa: number | null;
  palkinto: string | null;
  loppupisteet: number | null;
  sijoitus: string | null;
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
  ansiopisteetYhteensa: number | null;
  hakuKeskiarvo: number | null;
  haukkuKeskiarvo: number | null;
  ajotaitoKeskiarvo: number | null;
  yleisvaikutelmaPisteet: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
  tieJaEstetyoskentelyPisteet: number | null;
  metsastysintoPisteet: number | null;
  ylituomariNimi: string | null;
  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
  isanNimi: string | null;
  isanRekisterinumero: string | null;
  emanNimi: string | null;
  emanRekisterinumero: string | null;
  omistaja: string | null;
  omistajanKotikunta: string | null;
  sukupuoli: string | null;
  rokotusOk: boolean | null;
  tunnistusOk: boolean | null;
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
  huomautusTeksti: string | null;
  lisatiedot: AdminTrialLisatietoDb[];
  rawPayloadJson: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminTrialLisatietoDb = {
  koodi: string;
  nimi: string;
  era1Arvo: string | null;
  era2Arvo: string | null;
  era3Arvo: string | null;
  era4Arvo: string | null;
  jarjestys: number;
};

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
  organizer: string | null;
  judge: string | null;
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
  rank: string | null;
  award: string | null;
  points: number | null;
  judge: string | null;
};

export type AdminTrialEventDetailsDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
  sklKoeId: number | null;
  koemuoto: string | null;
  entries: AdminTrialEventEntryDb[];
};
