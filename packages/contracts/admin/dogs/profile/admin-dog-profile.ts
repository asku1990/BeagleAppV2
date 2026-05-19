export type AdminDogProfileRequest = {
  dogId: string;
};

export type AdminDogProfileSex = "MALE" | "FEMALE" | "UNKNOWN";

export type AdminDogProfileParentDto = {
  id?: string;
  name: string;
  registrationNo: string | null;
  ekNo?: number | null;
};

export type AdminDogProfileOwnerDto = {
  name: string;
  postalCode: string;
  city: string;
};

export type AdminDogProfileBreederDto = {
  name: string;
  ownerName: string | null;
  city: string | null;
  detailsSource: string | null;
};

export type AdminDogProfileDiseaseDto = {
  id: string;
  diseaseText: string;
  diseaseGroup: "EPILEPSIA" | "LAFORA" | "PURENTA" | "MLS" | "MUU";
  public: boolean;
  source: string | null;
};

export type AdminDogProfileDto = {
  id: string;
  name: string;
  registrationNo: string;
  registrationNos: string[];
  birthDate: string | null;
  sex: AdminDogProfileSex;
  color: string | null;
  ekNo: number | null;
  offspringCount: number;
  offspringLitterCount: number;
  inbreedingCoefficientPct: number | null;
  epiLuku: number | null;
  epiTeksti: string | null;
  laforaLuku: number | null;
  epiRiskLuku: number | null;
  healthSummary: string | null;
  diseases: AdminDogProfileDiseaseDto[];
  sire: AdminDogProfileParentDto | null;
  dam: AdminDogProfileParentDto | null;
  owners: AdminDogProfileOwnerDto[];
  breeder: AdminDogProfileBreederDto | null;
  breederNameText?: string | null;
  note: string | null;
};

export type AdminDogProfileResponse = {
  dog: AdminDogProfileDto;
};
