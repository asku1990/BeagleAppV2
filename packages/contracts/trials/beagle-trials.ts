export type BeagleTrialSearchSort = "date-desc" | "date-asc";

export type BeagleTrialSearchWeatherSummary =
  | { kind: "none" }
  | { kind: "single"; value: string }
  | { kind: "varied" };

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
  weather: BeagleTrialSearchWeatherSummary;
  average: number | null;
};

export type BeagleTrialAwardSummaryValue = {
  count: number;
  percentage: number;
};

export type BeagleTrialAwardSummaryRow = {
  trialType: "normal" | "long";
  first: BeagleTrialAwardSummaryValue;
  second: BeagleTrialAwardSummaryValue;
  third: BeagleTrialAwardSummaryValue;
  noPrize: BeagleTrialAwardSummaryValue;
  withdrew: BeagleTrialAwardSummaryValue;
  excluded: BeagleTrialAwardSummaryValue;
  awarded: BeagleTrialAwardSummaryValue;
  total: number;
};

export type BeagleTrialAwardSummary = {
  dateFrom: string | null;
  dateTo: string | null;
  rows: BeagleTrialAwardSummaryRow[];
};

export type BeagleTrialSearchResponse = {
  filters: BeagleTrialSearchFilters;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleTrialSearchRow[];
  awardSummary: BeagleTrialAwardSummary;
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
  trialRuleWindowId: string | null;
  dogId: string | null;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
  weather: string | null;
  award: string | null;
  classCode: string | null;
  rank: string | null;
  points: number | null;
  judge: string | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
};

export type BeagleTrialDetailsResponse = {
  trial: BeagleTrialDetailsEvent;
  items: BeagleTrialDetailsRow[];
};
