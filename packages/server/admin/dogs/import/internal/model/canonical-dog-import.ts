// Defines the source-neutral row produced by registry-specific adapters.
export const DOG_IMPORT_SOURCE = "FINNISH_KENNEL_CLUB" as const;

export type DogImportSource = typeof DOG_IMPORT_SOURCE;

export type CanonicalDogImportRow = {
  source: DogImportSource;
  sourceRowNumber: number;
  registrationNo: string | null;
  name: string | null;
  sex: "MALE" | "FEMALE" | null;
  birthDate: string | null;
  registeredOn: string | null;
  breederNameText: string | null;
  originTypeText: string | null;
  originCountryText: string | null;
  colorName: string | null;
  tailText: string | null;
  sireRegistrationNo: string | null;
  damRegistrationNo: string | null;
};
