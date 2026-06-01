import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";

const UNKNOWN_VALUE = "-";

export function showDash(value: string | number | null | undefined): string {
  if (value == null) {
    return UNKNOWN_VALUE;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : UNKNOWN_VALUE;
}

export function formatSex(sex: AdminDogDiseaseBrowseItem["sex"]): string {
  if (sex === "MALE") {
    return "Uros";
  }

  if (sex === "FEMALE") {
    return "Narttu";
  }

  if (sex === "UNKNOWN") {
    return "Tuntematon";
  }

  return UNKNOWN_VALUE;
}

export function formatCounts(
  trialCount: number | null,
  showCount: number | null,
): string {
  return `${showDash(trialCount)} / ${showDash(showCount)}`;
}

export function formatRegistrationAndEk(
  registrationNo: string,
  ekNo: number | null,
): string {
  const ekText = ekNo == null ? UNKNOWN_VALUE : `EK ${ekNo}`;
  return `${showDash(registrationNo)} / ${ekText}`;
}

export function formatParentLine(
  sire: AdminDogDiseaseBrowseItem["sire"],
  dam: AdminDogDiseaseBrowseItem["dam"],
): string {
  const formatParent = (label: string, parent: typeof sire) => {
    const name = parent.name?.trim() || UNKNOWN_VALUE;
    const registrationNo = showDash(parent.registrationNo);
    return `${label}: ${name} (${registrationNo})`;
  };

  return `${formatParent("I", sire)} | ${formatParent("E", dam)}`;
}
