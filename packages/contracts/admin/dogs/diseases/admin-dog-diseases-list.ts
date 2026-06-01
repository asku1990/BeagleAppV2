export type AdminDogDiseaseBrowseRequest = {
  diseaseCode?: string | null;
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
  public: boolean;
  registrationNo: string;
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
  total: number;
  totalPages: number;
  page: number;
  diseaseOptions: AdminDogDiseaseBrowseFilterOption[];
  items: AdminDogDiseaseBrowseItem[];
};
