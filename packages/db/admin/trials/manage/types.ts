export type AdminTrialSearchSortDb = "date-desc" | "date-asc";

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
  sourceKey: string;
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
