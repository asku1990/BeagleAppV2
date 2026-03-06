export type BeagleShowSearchSort = "date-desc" | "date-asc";

export type BeagleShowSearchMode = "year" | "range";

export type BeagleShowSearchRequest = {
  year?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  sort?: BeagleShowSearchSort;
};

export type BeagleShowSearchFilters = {
  mode: BeagleShowSearchMode;
  year: number | null;
  dateFrom: string | null;
  dateTo: string | null;
};

export type BeagleShowSearchRow = {
  showId: string;
  eventDate: string;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleShowSearchResponse = {
  filters: BeagleShowSearchFilters;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleShowSearchRow[];
};

export type BeagleShowDetailsRequest = {
  showId: string;
};

export type BeagleShowDetailsEvent = {
  showId: string;
  eventDate: string;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleShowDetailsRow = {
  id: string;
  dogId: string;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
  result: string | null;
  heightCm: number | null;
  judge: string | null;
};

export type BeagleShowDetailsResponse = {
  show: BeagleShowDetailsEvent;
  items: BeagleShowDetailsRow[];
};
