export type CreateAdminDogDiseaseEvidenceKind = "DOG" | "LITTER";

export type CreateAdminDogDiseaseRequest = {
  evidenceKind: CreateAdminDogDiseaseEvidenceKind;
  diseaseCode: string;
  registrationNo: string;
  sireRegistrationNo?: string | null;
  damRegistrationNo?: string | null;
  litter?: string | null;
  description?: string | null;
  source?: string | null;
  public: boolean;
};

export type CreateAdminDogDiseaseResponse = {
  id: string;
};
