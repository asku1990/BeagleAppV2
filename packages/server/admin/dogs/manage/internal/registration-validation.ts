import {
  hasMaxLength,
  isValidRegistrationNo,
  normalizeRegistrationNo,
  normalizeRegistrationNos,
  normalizeRequiredText,
} from "../normalization";

export type RegistrationValidationFailureCode =
  | "INVALID_REGISTRATION_NO"
  | "REGISTRATION_NO_TOO_LONG"
  | "INVALID_REGISTRATION_NO_FORMAT"
  | "DUPLICATE_REGISTRATION_NO";

export type RegistrationValidationResult =
  | {
      ok: true;
      primaryRegistrationNo: string;
      secondaryRegistrationNos: string[];
      allRegistrationNos: string[];
    }
  | {
      ok: false;
      code: RegistrationValidationFailureCode;
      registrationCount?: number;
    };

export function validateRegistrationInput(
  registrationNoInput: string,
  secondaryRegistrationNosInput: string[] | undefined,
  maxLength: number,
): RegistrationValidationResult {
  const registrationNo = normalizeRequiredText(registrationNoInput);
  if (!registrationNo) {
    return {
      ok: false,
      code: "INVALID_REGISTRATION_NO",
    };
  }

  const primaryRegistrationNo = normalizeRegistrationNo(registrationNo);
  if (!primaryRegistrationNo) {
    return {
      ok: false,
      code: "INVALID_REGISTRATION_NO",
    };
  }

  const secondaryRegistrationNos = normalizeRegistrationNos(
    secondaryRegistrationNosInput,
  );
  const allRegistrationNos = [
    primaryRegistrationNo,
    ...secondaryRegistrationNos,
  ];

  if (allRegistrationNos.some((value) => !hasMaxLength(value, maxLength))) {
    return {
      ok: false,
      code: "REGISTRATION_NO_TOO_LONG",
      registrationCount: allRegistrationNos.length,
    };
  }

  if (allRegistrationNos.some((value) => !isValidRegistrationNo(value))) {
    return {
      ok: false,
      code: "INVALID_REGISTRATION_NO_FORMAT",
      registrationCount: allRegistrationNos.length,
    };
  }

  if (new Set(allRegistrationNos).size !== allRegistrationNos.length) {
    return {
      ok: false,
      code: "DUPLICATE_REGISTRATION_NO",
      registrationCount: allRegistrationNos.length,
    };
  }

  return {
    ok: true,
    primaryRegistrationNo,
    secondaryRegistrationNos,
    allRegistrationNos,
  };
}
