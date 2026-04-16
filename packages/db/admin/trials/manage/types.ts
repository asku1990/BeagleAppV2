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
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  keli: string | null;
  paljasMaa: boolean | null;
  lumikeli: string | null;
  luokka: string | null;
  palkinto: string | null;
  loppupisteet: number | null;
  sijoitus: string | null;
  hakuKeskiarvo: number | null;
  haukkuKeskiarvo: number | null;
  yleisvaikutelmaPisteet: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tieJaEstetyoskentelyPisteet: number | null;
  metsastysintoPisteet: number | null;
  ylituomariNimi: string | null;
  rokotusOk: boolean | null;
  tunnistusOk: boolean | null;
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
