export type AdminTrialSearchSort = "date-desc" | "date-asc";

export type AdminTrialSearchRequest = {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminTrialSearchSort;
};

export type AdminTrialSummary = {
  trialId: string;
  dogName: string;
  registrationNo: string | null;
  sourceKey: string;
  eventDate: string;
  eventPlace: string;
  judge: string | null;
  piste: number | null;
  pa: string | null;
  sija: string | null;
};

export type AdminTrialSearchResponse = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialSummary[];
};
