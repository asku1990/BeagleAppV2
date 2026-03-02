export type BeagleSearchSort =
  | "name-asc"
  | "birth-desc"
  | "reg-desc"
  | "created-desc"
  | "ek-asc";

export type BeagleSearchMode = "none" | "ek" | "reg" | "name" | "combined";
export type BeagleSearchSex = "male" | "female";

export type BeagleSearchRequest = {
  ek?: string;
  reg?: string;
  name?: string;
  sex?: BeagleSearchSex;
  birthYearFrom?: number;
  birthYearTo?: number;
  ekOnly?: boolean;
  multipleRegsOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: BeagleSearchSort;
};

export type BeagleSearchRow = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  registrationNos: string[];
  createdAt: string;
  sex: "U" | "N" | "-";
  name: string;
  birthDate: string | null;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

export type BeagleSearchResponse = {
  mode: BeagleSearchMode;
  total: number;
  totalPages: number;
  page: number;
  items: BeagleSearchRow[];
};

export type BeagleNewestRequest = {
  limit?: number;
};

export type BeagleNewestResponse = {
  items: BeagleSearchRow[];
};
