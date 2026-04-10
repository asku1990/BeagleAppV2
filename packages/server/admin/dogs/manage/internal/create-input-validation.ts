import type {
  CreateAdminDogRequest,
  CreateAdminDogResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import {
  normalizeDistinctNames,
  normalizeOptionalText,
  normalizeRequiredText,
  parseBirthDate,
  parseDogSex,
  parsePositiveInteger,
} from "../normalization";
import {
  duplicateRegistrationNoResponse,
  invalidBirthDateResponse,
  invalidEkNoResponse,
  invalidNameResponse,
  invalidRegistrationNoFormatResponse,
  invalidRegistrationNoResponse,
  invalidSexResponse,
  nameTooLongResponse,
  noteTooLongResponse,
  registrationNoTooLongResponse,
} from "./manage-responses";
import { validateRegistrationInput } from "./registration-validation";
import {
  validateDogTitles,
  type DogTitleValidationResult,
} from "./title-validation";

type CreateValidationFailure = {
  ok: false;
  logContext: Record<string, unknown>;
  logMessage: string;
  response: ServiceResult<CreateAdminDogResponse>;
};

type CreateValidationSuccess<T> = {
  ok: true;
  data: T;
};

export type CreatePreflightValidationResult =
  | CreateValidationSuccess<{
      name: string;
      sex: "MALE" | "FEMALE" | "UNKNOWN";
      birthDate: Date | null;
      ekNo: number | null;
      primaryRegistrationNo: string;
      secondaryRegistrationNos: string[];
      allRegistrationNos: string[];
    }>
  | CreateValidationFailure;

export type CreateInTryValidationResult =
  | CreateValidationSuccess<{
      note: string | null;
      breederNameText: string | null;
      ownerNames: string[];
      parsedTitles: Extract<DogTitleValidationResult, { ok: true }>;
    }>
  | CreateValidationFailure;

export function validateCreatePreflight(
  input: CreateAdminDogRequest,
  maxNameLength: number,
  maxRegistrationNoLength: number,
): CreatePreflightValidationResult {
  const name = normalizeRequiredText(input.name);
  if (!name) {
    return {
      ok: false,
      logContext: { event: "invalid_name" },
      logMessage: "admin dog create rejected because name is invalid",
      response: invalidNameResponse(),
    };
  }

  if (name.length > maxNameLength) {
    return {
      ok: false,
      logContext: { event: "name_too_long" },
      logMessage: "admin dog create rejected because name is too long",
      response: nameTooLongResponse(maxNameLength),
    };
  }

  const sex = parseDogSex(input.sex);
  if (!sex) {
    return {
      ok: false,
      logContext: { event: "invalid_sex", sex: input.sex },
      logMessage: "admin dog create rejected because sex is invalid",
      response: invalidSexResponse(),
    };
  }

  const birthDate = parseBirthDate(input.birthDate);
  if (birthDate === "INVALID") {
    return {
      ok: false,
      logContext: { event: "invalid_birth_date", birthDate: input.birthDate },
      logMessage: "admin dog create rejected because birth date is invalid",
      response: invalidBirthDateResponse(),
    };
  }

  const ekNo = parsePositiveInteger(input.ekNo);
  if (ekNo === "INVALID") {
    return {
      ok: false,
      logContext: { event: "invalid_ek_no", ekNo: input.ekNo },
      logMessage: "admin dog create rejected because EK number is invalid",
      response: invalidEkNoResponse(),
    };
  }

  const registration = validateRegistrationInput(
    input.registrationNo,
    input.secondaryRegistrationNos,
    maxRegistrationNoLength,
  );
  if (!registration.ok) {
    if (registration.code === "INVALID_REGISTRATION_NO") {
      return {
        ok: false,
        logContext: { event: "invalid_registration_no" },
        logMessage:
          "admin dog create rejected because registration number is invalid",
        response: invalidRegistrationNoResponse(),
      };
    }

    if (registration.code === "REGISTRATION_NO_TOO_LONG") {
      return {
        ok: false,
        logContext: {
          event: "registration_no_too_long",
          registrationCount: registration.registrationCount,
        },
        logMessage:
          "admin dog create rejected because registration number is too long",
        response: registrationNoTooLongResponse(maxRegistrationNoLength),
      };
    }

    if (registration.code === "INVALID_REGISTRATION_NO_FORMAT") {
      return {
        ok: false,
        logContext: {
          event: "invalid_registration_no_format",
          registrationCount: registration.registrationCount,
        },
        logMessage:
          "admin dog create rejected because registration number format is invalid",
        response: invalidRegistrationNoFormatResponse(),
      };
    }

    return {
      ok: false,
      logContext: {
        event: "duplicate_registration_no_payload",
        registrationCount: registration.registrationCount,
      },
      logMessage:
        "admin dog create rejected because duplicate registration numbers were provided",
      response: duplicateRegistrationNoResponse(),
    };
  }

  return {
    ok: true,
    data: {
      name,
      sex,
      birthDate,
      ekNo,
      primaryRegistrationNo: registration.primaryRegistrationNo,
      secondaryRegistrationNos: registration.secondaryRegistrationNos,
      allRegistrationNos: registration.allRegistrationNos,
    },
  };
}

export function validateCreateInTry(
  input: CreateAdminDogRequest,
  maxNoteLength: number,
): CreateInTryValidationResult {
  const note = normalizeOptionalText(input.note);
  if (note !== null && note.length > maxNoteLength) {
    return {
      ok: false,
      logContext: { event: "note_too_long" },
      logMessage: "admin dog create rejected because note is too long",
      response: noteTooLongResponse(maxNoteLength),
    };
  }

  const parsedTitles = validateDogTitles(input.titles);
  if (!parsedTitles.ok) {
    return {
      ok: false,
      logContext: {
        event: "invalid_titles",
        code: parsedTitles.response.body.code,
      },
      logMessage: "admin dog create rejected because title rows are invalid",
      response: parsedTitles.response,
    };
  }

  return {
    ok: true,
    data: {
      note,
      breederNameText: normalizeOptionalText(input.breederNameText),
      ownerNames: normalizeDistinctNames(input.ownerNames),
      parsedTitles,
    },
  };
}
