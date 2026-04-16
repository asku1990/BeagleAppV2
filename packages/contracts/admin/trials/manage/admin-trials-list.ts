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
  sklKoeId: number | null;
  entryKey: string;
  eventDate: string;
  eventPlace: string;
  ylituomariNimi: string | null;
  loppupisteet: number | null;
  palkinto: string | null;
  sijoitus: string | null;
};

export type AdminTrialSearchResponse = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialSummary[];
};
