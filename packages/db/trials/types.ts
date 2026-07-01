export type BeagleTrialSearchSortDb = "date-desc" | "date-asc";

export type BeagleTrialSearchRequestDb = {
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: BeagleTrialSearchSortDb;
};

export type BeagleTrialSearchRowDb = {
  trialEventId: string;
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
  trialEventId: string;
};

export type BeagleTrialDetailsRowDb = {
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

export type BeagleTrialDetailsResponseDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
  items: BeagleTrialDetailsRowDb[];
};

export type BeagleTrialDogRowDb = {
  id: string;
  trialEventId: string;
  trialRuleWindowId: string | null;
  place: string;
  date: Date;
  weather: string | null;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  classCode: string | null;
  rank: string | null;
  koiriaLuokassa: number | null;
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
