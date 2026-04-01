export type AdminShowSearchSortDb = "date-desc" | "date-asc";

export type AdminShowSearchRequestDb = {
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: AdminShowSearchSortDb;
};

export type AdminShowSearchRowDb = {
  eventKey: string;
  eventDate: Date;
  eventPlace: string;
  eventCity: string | null;
  eventName: string | null;
  eventType: string | null;
  organizer: string | null;
  judge: string | null;
  dogCount: number;
};

export type AdminShowSearchResponseDb = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminShowSearchRowDb[];
};

export type AdminShowDetailsRequestDb = {
  eventKey?: string | null;
  eventDate: Date;
  eventPlace: string;
};

export type AdminShowDetailsEntryRowDb = {
  id: string;
  registrationNo: string;
  dogName: string;
  judge: string | null;
  critiqueText: string | null;
  heightCm: number | null;
  classCode: string | null;
  qualityGrade: string | null;
  classPlacement: number | null;
  pupn: string | null;
  awards: string[];
};

export type AdminShowDetailsResponseDb = {
  eventKey: string;
  eventDate: Date;
  eventPlace: string;
  eventCity: string | null;
  eventName: string | null;
  eventType: string | null;
  organizer: string | null;
  judge: string | null;
  dogCount: number;
  items: AdminShowDetailsEntryRowDb[];
};
