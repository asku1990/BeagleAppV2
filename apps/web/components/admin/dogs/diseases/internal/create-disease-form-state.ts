import type {
  AdminDogDiseaseBrowseFilterOption,
  CreateAdminDogDiseaseEvidenceKind,
  CreateAdminDogDiseaseRequest,
} from "@beagle/contracts";

export type DiseaseCreateLabels = {
  title: string;
  aria: string;
  mode: string;
  modeDog: string;
  modeLitter: string;
  disease: string;
  registration: string;
  sire: string;
  dam: string;
  litter: string;
  description: string;
  source: string;
  public: string;
  publicNo: string;
  publicYes: string;
  save: string;
  saving: string;
  cancel: string;
};

export type CreateDiseaseFormValues = {
  evidenceKind: CreateAdminDogDiseaseEvidenceKind;
  diseaseCode: string;
  registrationNo: string;
  sireRegistrationNo: string;
  damRegistrationNo: string;
  litter: string;
  description: string;
  source: string;
  public: boolean;
};

export function createInitialDiseaseFormValues(
  diseaseOptions: AdminDogDiseaseBrowseFilterOption[],
  selectedDiseaseCode: string | null | undefined,
): CreateDiseaseFormValues {
  return {
    evidenceKind: "DOG",
    diseaseCode: selectedDiseaseCode ?? diseaseOptions[0]?.diseaseCode ?? "",
    registrationNo: "",
    sireRegistrationNo: "",
    damRegistrationNo: "",
    litter: "",
    description: "",
    source: "",
    public: false,
  };
}

export function isCreateDiseaseSubmitDisabled(
  values: CreateDiseaseFormValues,
  isSubmitting: boolean,
): boolean {
  return (
    isSubmitting ||
    values.diseaseCode.trim().length === 0 ||
    values.registrationNo.trim().length === 0 ||
    (values.evidenceKind === "LITTER" &&
      (values.sireRegistrationNo.trim().length === 0 ||
        values.damRegistrationNo.trim().length === 0))
  );
}

export function toCreateDiseaseRequest(
  values: CreateDiseaseFormValues,
): CreateAdminDogDiseaseRequest {
  return {
    evidenceKind: values.evidenceKind,
    diseaseCode: values.diseaseCode,
    registrationNo: values.registrationNo,
    sireRegistrationNo:
      values.evidenceKind === "LITTER" ? values.sireRegistrationNo : null,
    damRegistrationNo:
      values.evidenceKind === "LITTER" ? values.damRegistrationNo : null,
    litter: values.litter,
    description: values.description,
    source: values.source,
    public: values.public,
  };
}
