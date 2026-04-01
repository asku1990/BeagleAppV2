export type AdminShowSearchSort = "date-desc" | "date-asc";

export type AdminShowSearchRequest = {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminShowSearchSort;
};

export type AdminShowEventSummary = {
  showId: string;
  eventDate: string;
  eventPlace: string;
  eventCity: string;
  eventName: string;
  eventType: string;
  organizer: string;
  judge: string;
  dogCount: number;
};

export type AdminShowSearchResponse = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminShowEventSummary[];
};

export type AdminShowEntry = {
  id: string;
  registrationNo: string;
  dogName: string;
  judge: string;
  critiqueText: string;
  heightCm: string;
  classCode: string;
  qualityGrade: string;
  classPlacement: string;
  pupn: string;
  awards: string[];
};

export type AdminShowDetailsRequest = {
  showId: string;
};

export type AdminShowDetailsEvent = AdminShowEventSummary & {
  entries: AdminShowEntry[];
};

export type AdminShowDetailsResponse = {
  show: AdminShowDetailsEvent;
};
