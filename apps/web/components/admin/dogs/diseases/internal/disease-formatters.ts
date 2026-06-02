import type { AdminDogDiseaseBrowseItem } from "@beagle/contracts";

const UNKNOWN_VALUE = "-";

type BinaryLabels = {
  yes: string;
  no: string;
};

type SexLabels = {
  male: string;
  female: string;
  unknown: string;
};

type ParentLabels = {
  sire: string;
  dam: string;
};

export function showDash(value: string | number | null | undefined): string {
  if (value == null) {
    return UNKNOWN_VALUE;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : UNKNOWN_VALUE;
}

export function formatPublicStatus(
  isPublic: boolean,
  labels: BinaryLabels,
): string {
  return isPublic ? labels.yes : labels.no;
}

export function formatSex(
  sex: AdminDogDiseaseBrowseItem["sex"],
  labels: SexLabels,
): string {
  if (sex === "MALE") {
    return labels.male;
  }

  if (sex === "FEMALE") {
    return labels.female;
  }

  if (sex === "UNKNOWN") {
    return labels.unknown;
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
  labels: ParentLabels,
): string {
  const formatParent = (label: string, parent: typeof sire) => {
    const name = parent.name?.trim() || UNKNOWN_VALUE;
    const registrationNo = showDash(parent.registrationNo);
    return `${label}: ${name} (${registrationNo})`;
  };

  return `${formatParent(labels.sire, sire)} | ${formatParent(labels.dam, dam)}`;
}
