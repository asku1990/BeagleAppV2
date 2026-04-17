export type AdminTrialSearchSortDb = "date-desc" | "date-asc";

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
  lisatiedotJson: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminTrialSearchRequestDb = {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminTrialSearchSortDb;
};

export type AdminTrialSummaryDb = {
  trialId: string;
  dogName: string;
  registrationNo: string | null;
  sklKoeId: number | null;
  entryKey: string;
  eventDate: Date;
  eventPlace: string;
  ylituomariNimi: string | null;
  loppupisteet: number | null;
  palkinto: string | null;
  sijoitus: string | null;
};

export type AdminTrialSearchResponseDb = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialSummaryDb[];
};
