export type AdminDogListSex = "MALE" | "FEMALE" | "UNKNOWN";

export type AdminDogParentPreview = {
  id: string;
  name: string;
  registrationNo: string | null;
};

export type AdminDogTitleInput = {
  awardedOn?: string | null;
  titleCode: string;
  titleName?: string | null;
  sortOrder?: number;
};

export type AdminDogTitleItem = {
  id: string;
  awardedOn: string | null;
  titleCode: string;
  titleName: string | null;
  sortOrder: number;
};

export type AdminDogListItem = {
  id: string;
  registrationNo: string | null;
  secondaryRegistrationNos: string[];
  name: string;
  sex: AdminDogListSex;
  birthDate: string | null;
  breederName: string | null;
  ownerNames: string[];
  sire: AdminDogParentPreview | null;
  dam: AdminDogParentPreview | null;
  trialCount: number;
  showCount: number;
  ekNo: number | null;
  note: string | null;
  titles?: AdminDogTitleItem[];
};

export type AdminDogListSort = "name-asc" | "birth-desc" | "created-desc";

export type AdminDogListRequest = {
  query?: string;
  sex?: AdminDogListSex;
  page?: number;
  pageSize?: number;
  sort?: AdminDogListSort;
};

export type AdminDogListResponse = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminDogListItem[];
};
