const LEGACY_SYNTHETIC_DISEASE_REGISTRATION_WITH_UNDERSCORE_PATTERN =
  /^[A-Z]+_\d+\/\d+$/iu;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isLegacySyntheticDiseaseRegistration(
  registrationNo: string,
  diseaseCode: string,
): boolean {
  if (
    LEGACY_SYNTHETIC_DISEASE_REGISTRATION_WITH_UNDERSCORE_PATTERN.test(
      registrationNo,
    )
  ) {
    return true;
  }

  const prefix = diseaseCode.trim().toUpperCase();
  if (!prefix) {
    return false;
  }

  return new RegExp(`^${escapeRegExp(prefix)}\\d+\\/\\d+$`, "iu").test(
    registrationNo,
  );
}
