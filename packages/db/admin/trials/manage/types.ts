export type AdminTrialEventSearchSortDb = "date-desc" | "date-asc";

export type AdminTrialEventSearchRequestDb = {
  query?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: AdminTrialEventSearchSortDb;
};

export type AdminTrialEventSummaryDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
  sklKoeId: number | null;
  dogCount: number;
};

export type AdminTrialEventSearchResponseDb = {
  availableEventDates: Date[];
  total: number;
  totalPages: number;
  page: number;
  items: AdminTrialEventSummaryDb[];
};

export type AdminTrialEventDetailsRequestDb = {
  trialEventId: string;
};

export type AdminTrialEventEntryDb = {
  trialId: string;
  dogId: string | null;
  dogName: string;
  registrationNo: string | null;
  entryKey: string;
  rank: string | null;
  award: string | null;
  points: number | null;
  judge: string | null;
  kokokaudenkoe: boolean | null;
};

export type AdminTrialEventDetailsDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
  sklKoeId: number | null;
  koemuoto: string | null;
  entries: AdminTrialEventEntryDb[];
};
