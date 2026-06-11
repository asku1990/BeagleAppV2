export type AdminDogDiseaseBrowseRequest = {
  diseaseCode?: string | null;
  query?: string | null;
  page?: number;
};

export type AdminDogDiseaseBrowseFilterOption = {
  diseaseCode: string;
  diseaseText: string;
  count: number;
};

export type AdminDogDiseaseBrowseParentPreview = {
  registrationNo: string | null;
  name: string | null;
};

export type AdminDogDiseaseBrowseItem = {
  id: string;
  evidenceKind: "DOG" | "LITTER";
  diseaseCode: string;
  diseaseText: string;
  pentue: string | null;
  kuvaus: string | null;
  public: boolean;
  registrationNo: string;
  tietolahde: string | null;
  ekNo: number | null;
  sex: "MALE" | "FEMALE" | "UNKNOWN" | null;
  name: string;
  dogId: string | null;
  trialCount: number | null;
  showCount: number | null;
  sire: AdminDogDiseaseBrowseParentPreview;
  dam: AdminDogDiseaseBrowseParentPreview;
};

export type AdminDogDiseaseBrowseResponse = {
  selectedDiseaseCode: string | null;
  query: string;
  total: number;
  totalPages: number;
  page: number;
  diseaseOptions: AdminDogDiseaseBrowseFilterOption[];
  items: AdminDogDiseaseBrowseItem[];
};
