import type { DogSex, SairausRyhma } from "@prisma/client";

export type AdminDogDiseaseBrowseRequestDb = {
  selectedDiseaseCode: string | null;
  selectedDiseaseGroup: SairausRyhma | null;
  query: string;
  page: number;
  pageSize: number;
};

export type AdminDogDiseaseDefinitionOptionDb = {
  diseaseCode: string;
  diseaseText: string;
  diseaseGroup: SairausRyhma;
  count: number;
};

export type AdminDogDiseaseBrowseFilterOptionDb = {
  diseaseCode: string;
  diseaseText: string;
  count: number;
};

export type AdminDogDiseaseBrowseGroupOptionDb = {
  diseaseGroup: SairausRyhma;
  count: number;
};

export type AdminDogDiseaseBrowseParentPreviewDb = {
  registrationNo: string | null;
  name: string | null;
};

export type AdminDogDiseaseBrowseDogDb = {
  id: string;
  name: string;
  sex: DogSex;
  ekNo: number | null;
  _count: {
    trialResults: number;
    showEntries: number;
  };
};

export type AdminDogDiseaseBrowseItemDb = {
  id: string;
  evidenceKind: "DOG" | "LITTER";
  rekisterinumero: string;
  pentue: string | null;
  kuvaus: string | null;
  julkinen: boolean;
  isaRekisterinumero: string | null;
  emaRekisterinumero: string | null;
  tietolahde: string | null;
  sairaus: {
    koodi: string;
    sairausTeksti: string;
  };
  dog: AdminDogDiseaseBrowseDogDb | null;
  sire: AdminDogDiseaseBrowseParentPreviewDb;
  dam: AdminDogDiseaseBrowseParentPreviewDb;
};

export type AdminDogDiseaseBrowseResponseDb = {
  selectedDiseaseCode: string | null;
  selectedDiseaseGroup: SairausRyhma | null;
  query: string;
  total: number;
  totalPages: number;
  page: number;
  diseaseGroupOptions: AdminDogDiseaseBrowseGroupOptionDb[];
  diseaseOptions: AdminDogDiseaseBrowseFilterOptionDb[];
  items: AdminDogDiseaseBrowseItemDb[];
};
