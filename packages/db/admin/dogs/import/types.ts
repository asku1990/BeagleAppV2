export type DogImportStateDb = {
  breedersByKennel: Map<string, Array<{ id: string; name: string }>>;
  historicalLinksByRegistration: Record<
    string,
    {
      showEntries: Array<{ id: string; registrationNo: string }>;
      trialEntries: Array<{ id: string; registrationNo: string }>;
    }
  >;
  dogs: Array<{
    id: string;
    registrationNo: string;
    name: string;
    sex: "MALE" | "FEMALE" | "UNKNOWN";
    status: "NORMAL" | "REFERENCE_ONLY";
    birthDate: Date | null;
    sireId: string | null;
    damId: string | null;
    breederId: string | null;
    breederName: string | null;
    colorCode: number | null;
    originTypeText: string | null;
    originCountryText: string | null;
    tailText: string | null;
    updatedAt: Date;
    registrationId: string;
    registeredOn: Date | null;
    registrationUpdatedAt: Date;
  }>;
  colors: Array<{
    code: number;
    nameFi: string;
    status: string;
    updatedAt: Date;
  }>;
};

export type DogImportDogUpdateData = {
  birthDate?: string | null;
  breederId?: string;
  originTypeText?: string;
  originCountryText?: string;
  tailText?: string;
  colorCode?: number | null;
  status?: "NORMAL";
  name?: string;
  sex?: "MALE" | "FEMALE";
};

export type DogImportWritePlanDb = {
  breederMatches: Array<{ kennel: string; id: string; name: string }>;
  creates: Array<{
    registrationNo: string;
    name: string;
    sex: "MALE" | "FEMALE";
    birthDate: string | null;
    registeredOn: string | null;
    breederId: string | null;
    originTypeText: string | null;
    originCountryText: string | null;
    tailText: string | null;
    colorCode: number | null;
    sireRegistrationNo: string;
    damRegistrationNo: string;
  }>;
  updates: Array<{
    id: string;
    registrationId: string;
    expectedUpdatedAt: Date;
    expectedRegistrationUpdatedAt: Date;
    data: DogImportDogUpdateData;
    registeredOn?: string | null;
    sireRegistrationNo: string;
    damRegistrationNo: string;
  }>;
  references: Array<{ registrationNo: string; sex: "MALE" | "FEMALE" }>;
  historicalLinks: Array<{
    registrationNo: string;
    showEntryIds: string[];
    trialEntryIds: string[];
  }>;
};
