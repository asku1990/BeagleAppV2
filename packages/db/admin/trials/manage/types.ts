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
  ke: string | null;
  lk: string | null;
  pa: string | null;
  piste: number | null;
  sija: string | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  judge: string | null;
  legacyFlag: string | null;
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
  judge: string | null;
  piste: number | null;
  pa: string | null;
  sija: string | null;
};

export type AdminTrialSearchResponseDb = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialSummaryDb[];
};
