export type BeagleTrialSearchSortDb = "date-desc" | "date-asc";

export type BeagleTrialSearchRequestDb = {
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: BeagleTrialSearchSortDb;
};

export type BeagleTrialSearchRowDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleTrialSearchResponseDb = {
  availableEventDates: Date[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleTrialSearchRowDb[];
};

export type BeagleTrialDetailsRequestDb = {
  eventDateStart: Date;
  eventDateEndExclusive: Date;
  eventPlace: string;
};

export type BeagleTrialDetailsRowDb = {
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
  // Legacy per-dog scoring fields from `akoeall` rows.
  // TAPPA -> eventPlace (event-level), these remain dog-row metrics.
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  // Internal import-trace fields (not exposed in public contract/UI).
  legacyFlag: string | null;
  sourceKey: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BeagleTrialDetailsResponseDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
  items: BeagleTrialDetailsRowDb[];
};

export type BeagleTrialDogRowDb = {
  id: string;
  place: string;
  date: Date;
  weather: string | null;
  className: string | null;
  classCode: string | null;
  rank: string | null;
  points: number | null;
  award: string | null;
  judge: string | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
};
