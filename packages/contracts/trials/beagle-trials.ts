export type BeagleTrialSearchSort = "date-desc" | "date-asc";

export type BeagleTrialSearchMode = "year" | "range";

export type BeagleTrialSearchRequest = {
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: BeagleTrialSearchSort;
};

export type BeagleTrialSearchFilters = {
  mode: BeagleTrialSearchMode;
  year: number | null;
  dateFrom: string | null;
  dateTo: string | null;
};

export type BeagleTrialSearchRow = {
  trialId: string;
  eventDate: string;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleTrialSearchResponse = {
  filters: BeagleTrialSearchFilters;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleTrialSearchRow[];
};

export type BeagleTrialDetailsRequest = {
  trialId: string;
};

export type BeagleTrialDetailsEvent = {
  trialId: string;
  eventDate: string;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleTrialDetailsRow = {
  id: string;
  dogId: string;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
  weather: string | null;
  award: string | null;
  classCode: string | null;
  rank: string | null;
  points: number | null;
  judge: string | null;
};

export type BeagleTrialDetailsResponse = {
  trial: BeagleTrialDetailsEvent;
  items: BeagleTrialDetailsRow[];
};
