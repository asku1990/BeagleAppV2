// Validates resolved parent roles before disease litter evidence is persisted.
type LitterParent = {
  id: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
};

export type LitterParentValidationErrorCode =
  | "INVALID_PARENT_COMBINATION"
  | "INVALID_SIRE_SEX"
  | "INVALID_DAM_SEX";

export function validateLitterParents(
  sire: LitterParent,
  dam: LitterParent,
): LitterParentValidationErrorCode | null {
  if (sire.id === dam.id) {
    return "INVALID_PARENT_COMBINATION";
  }

  if (sire.sex !== "MALE") {
    return "INVALID_SIRE_SEX";
  }

  if (dam.sex !== "FEMALE") {
    return "INVALID_DAM_SEX";
  }

  return null;
}
