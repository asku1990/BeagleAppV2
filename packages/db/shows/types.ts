export type BeagleShowSearchSortDb = "date-desc" | "date-asc";
export type BeagleShowSearchModeDb = "year" | "range";

export type BeagleShowSearchRequestDb = {
  mode: BeagleShowSearchModeDb;
  year?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: BeagleShowSearchSortDb;
};

export type BeagleShowSearchRowDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleShowSearchResponseDb = {
  mode: BeagleShowSearchModeDb;
  year: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleShowSearchRowDb[];
};

export type BeagleShowDetailsRequestDb = {
  eventDate: Date;
  eventPlace: string;
};

export type BeagleShowDetailsRowDb = {
  id: string;
  dogId: string;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
  result: string | null;
  heightCm: number | null;
  judge: string | null;
};

export type BeagleShowDetailsResponseDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
  items: BeagleShowDetailsRowDb[];
};

export type BeagleShowDogRowDb = {
  id: string;
  place: string;
  date: Date;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
};
