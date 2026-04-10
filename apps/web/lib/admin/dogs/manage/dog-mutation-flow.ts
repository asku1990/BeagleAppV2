import type {
  CreateAdminDogRequest,
  UpdateAdminDogRequest,
} from "@beagle/contracts";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import type {
  AdminDogFormValues,
  AdminDogRecord,
} from "@/components/admin/dogs/types";
import type { MessageKey } from "@/lib/i18n/messages";

// Normalizes admin dog form values into mutation payloads and mutation error message keys.
function normalizeOptionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeParentRegistrationForUpdate(value: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : "";
}

function resolveParentRegistrationUpdateValue(
  currentValue: string,
  initialValue: string,
): string | null | undefined {
  const normalizedCurrent = normalizeParentRegistrationForUpdate(currentValue);
  const normalizedInitial = normalizeParentRegistrationForUpdate(initialValue);

  if (normalizedCurrent === normalizedInitial) {
    return undefined;
  }

  return normalizedCurrent.length > 0 ? normalizedCurrent : null;
}

function normalizeEkNo(value: string): number | null {
  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeSecondaryRegistrations(values: string[]): string[] {
  return values
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value.length > 0);
}

function normalizeTitlesForMutation(
  values: AdminDogFormValues["titles"],
): Array<{
  awardedOn?: string | null;
  titleCode: string;
  titleName?: string | null;
}> {
  return values.map((title) => ({
    awardedOn: normalizeOptionalText(title.awardedOn),
    titleCode: title.titleCode.trim(),
    titleName: normalizeOptionalText(title.titleName),
  }));
}

export function toCreateAdminDogRequest(
  values: AdminDogFormValues,
): CreateAdminDogRequest {
  return {
    name: values.name,
    sex: values.sex,
    birthDate: normalizeOptionalText(values.birthDate) ?? undefined,
    breederNameText: normalizeOptionalText(values.breederNameText) ?? undefined,
    ownerNames: values.ownershipNames,
    ekNo: normalizeEkNo(values.ekNo) ?? undefined,
    note: normalizeOptionalText(values.note) ?? undefined,
    registrationNo: values.registrationNo.trim(),
    secondaryRegistrationNos: normalizeSecondaryRegistrations(
      values.secondaryRegistrationNos,
    ),
    sireRegistrationNo:
      normalizeOptionalText(values.sirePreviewRegistrationNo) ?? undefined,
    damRegistrationNo:
      normalizeOptionalText(values.damPreviewRegistrationNo) ?? undefined,
    titles: normalizeTitlesForMutation(values.titles),
  };
}

export function toUpdateAdminDogRequest(
  values: AdminDogFormValues,
  target: AdminDogRecord,
): UpdateAdminDogRequest {
  return {
    id: target.id,
    name: values.name,
    sex: values.sex,
    birthDate: normalizeOptionalText(values.birthDate),
    breederNameText: normalizeOptionalText(values.breederNameText),
    ownerNames: values.ownershipNames,
    ekNo: normalizeEkNo(values.ekNo),
    note: normalizeOptionalText(values.note),
    registrationNo: values.registrationNo.trim(),
    secondaryRegistrationNos: normalizeSecondaryRegistrations(
      values.secondaryRegistrationNos,
    ),
    sireRegistrationNo: resolveParentRegistrationUpdateValue(
      values.sirePreviewRegistrationNo,
      target.sirePreview?.registrationNo ?? "",
    ),
    damRegistrationNo: resolveParentRegistrationUpdateValue(
      values.damPreviewRegistrationNo,
      target.damPreview?.registrationNo ?? "",
    ),
    titles: normalizeTitlesForMutation(values.titles),
  };
}

export function getAdminDogMutationErrorCode(
  error: unknown,
): string | undefined {
  if (error instanceof AdminMutationError) {
    return error.errorCode;
  }

  return undefined;
}

// Maps backend mutation error codes to admin dog i18n message keys.
export function getAdminDogMutationErrorMessageKey(
  errorCode?: string,
): MessageKey {
  switch (errorCode) {
    case "INVALID_DOG_ID":
      return "admin.dogs.mutation.errorInvalidDogId";
    case "INVALID_NAME":
      return "admin.dogs.mutation.errorInvalidName";
    case "INVALID_REGISTRATION_NO":
      return "admin.dogs.mutation.errorInvalidRegistrationNo";
    case "DUPLICATE_REGISTRATION_NO":
      return "admin.dogs.mutation.errorDuplicateRegistrationNo";
    case "NAME_TOO_LONG":
      return "admin.dogs.mutation.errorNameTooLong";
    case "INVALID_SEX":
      return "admin.dogs.mutation.errorInvalidSex";
    case "INVALID_BIRTH_DATE":
      return "admin.dogs.mutation.errorInvalidBirthDate";
    case "INVALID_EK_NO":
      return "admin.dogs.mutation.errorInvalidEkNo";
    case "REGISTRATION_NO_TOO_LONG":
      return "admin.dogs.mutation.errorRegistrationTooLong";
    case "NOTE_TOO_LONG":
      return "admin.dogs.mutation.errorNoteTooLong";
    case "INVALID_SIRE_REGISTRATION":
      return "admin.dogs.mutation.errorInvalidSireRegistration";
    case "INVALID_DAM_REGISTRATION":
      return "admin.dogs.mutation.errorInvalidDamRegistration";
    case "INVALID_PARENT_COMBINATION":
      return "admin.dogs.mutation.errorInvalidParentCombination";
    case "INVALID_SELF_PARENT":
      return "admin.dogs.mutation.errorInvalidSelfParent";
    case "INVALID_SIRE_SEX":
      return "admin.dogs.mutation.errorInvalidSireSex";
    case "INVALID_DAM_SEX":
      return "admin.dogs.mutation.errorInvalidDamSex";
    case "DUPLICATE_DOG":
      return "admin.dogs.mutation.errorDuplicateDog";
    case "DOG_NOT_FOUND":
      return "admin.dogs.mutation.errorDogNotFound";
    case "INVALID_TITLE_CODE":
      return "admin.dogs.mutation.errorInvalidTitleCode";
    case "INVALID_TITLE_AWARDED_ON":
      return "admin.dogs.mutation.errorInvalidTitleAwardedOn";
    case "INVALID_TITLE_SORT_ORDER":
      return "admin.dogs.mutation.errorInvalidTitleSortOrder";
    case "DUPLICATE_DOG_TITLE":
      return "admin.dogs.mutation.errorDuplicateDogTitle";
    default:
      return "admin.dogs.mutation.errorDefault";
  }
}
