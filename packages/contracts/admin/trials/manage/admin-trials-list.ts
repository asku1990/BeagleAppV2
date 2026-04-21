export type AdminTrialEventSearchSort = "date-desc" | "date-asc";

export type AdminTrialEventSearchMode = "year" | "range";

export type AdminTrialEventSearchRequest = {
  query?: string;
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminTrialEventSearchSort;
};

export type AdminTrialEventSearchFilters = {
  mode: AdminTrialEventSearchMode;
  year: number | null;
  dateFrom: string | null;
  dateTo: string | null;
};

export type AdminTrialEventSummary = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
  sklKoeId: number | null;
  dogCount: number;
};

export type AdminTrialEventSearchResponse = {
  filters: AdminTrialEventSearchFilters;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialEventSummary[];
};
