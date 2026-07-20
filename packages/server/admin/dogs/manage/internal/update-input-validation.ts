import type {
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import { isFutureBusinessDate, toDateOnly } from "@server/core/date-only";
import type { ServiceResult } from "@server/core/result";
import { parseDogId } from "@server/dogs/core";
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
  invalidColorCodeResponse,
  invalidDogIdResponse,
  invalidDogStatusResponse,
  invalidEkNoResponse,
  invalidEkNoAssignedOnResponse,
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

type UpdateValidationFailure = {
  ok: false;
  logContext: Record<string, unknown>;
  logMessage: string;
  response: ServiceResult<UpdateAdminDogResponse>;
};

type UpdateValidationSuccess<T> = {
  ok: true;
  data: T;
};

export type UpdatePreflightValidationResult =
  | UpdateValidationSuccess<{
      id: string;
      status: "NORMAL" | "REFERENCE_ONLY";
      name: string;
      sex: "MALE" | "FEMALE" | "UNKNOWN";
      birthDate: Date | null | undefined;
      ekNo: number | null | undefined;
      ekNoAssignedOn: Date | null | undefined;
      colorCode: number | null | undefined;
      primaryRegistrationNo: string;
      secondaryRegistrationNos: string[];
      allRegistrationNos: string[];
    }>
  | UpdateValidationFailure;

export type UpdateInTryValidationResult =
  | UpdateValidationSuccess<{
      note: string | null | undefined;
      breederNameText: string | null | undefined;
      ownerNames: string[] | undefined;
      parsedTitles: Extract<DogTitleValidationResult, { ok: true }> | undefined;
      sireRegistrationNo: string | null | undefined;
      damRegistrationNo: string | null | undefined;
    }>
  | UpdateValidationFailure;

export function validateUpdatePreflight(
  input: UpdateAdminDogRequest,
  maxNameLength: number,
  maxRegistrationNoLength: number,
): UpdatePreflightValidationResult {
  const id = parseDogId(input.id);
  if (!id) {
    return {
      ok: false,
      logContext: { event: "invalid_dog_id" },
      logMessage: "admin dog update rejected because dog id is invalid",
      response: invalidDogIdResponse(),
    };
  }

  const status = input.status;
  if (status !== "NORMAL" && status !== "REFERENCE_ONLY") {
    return {
      ok: false,
      logContext: { event: "invalid_dog_status", dogId: id, status },
      logMessage: "admin dog update rejected because dog status is invalid",
      response: invalidDogStatusResponse(),
    };
  }

  const name = normalizeRequiredText(input.name);
  if (!name && status === "NORMAL") {
    return {
      ok: false,
      logContext: { event: "invalid_name", dogId: id },
      logMessage: "admin dog update rejected because name is invalid",
      response: invalidNameResponse(),
    };
  }

  if (name && name.length > maxNameLength) {
    return {
      ok: false,
      logContext: { event: "name_too_long", dogId: id },
      logMessage: "admin dog update rejected because name is too long",
      response: nameTooLongResponse(maxNameLength),
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
        logContext: { event: "invalid_registration_no", dogId: id },
        logMessage:
          "admin dog update rejected because registration number is invalid",
        response: invalidRegistrationNoResponse(),
      };
    }

    if (registration.code === "REGISTRATION_NO_TOO_LONG") {
      return {
        ok: false,
        logContext: {
          event: "registration_no_too_long",
          dogId: id,
          registrationCount: registration.registrationCount,
        },
        logMessage:
          "admin dog update rejected because registration number is too long",
        response: registrationNoTooLongResponse(maxRegistrationNoLength),
      };
    }

    if (registration.code === "INVALID_REGISTRATION_NO_FORMAT") {
      return {
        ok: false,
        logContext: {
          event: "invalid_registration_no_format",
          dogId: id,
          registrationCount: registration.registrationCount,
        },
        logMessage:
          "admin dog update rejected because registration number format is invalid",
        response: invalidRegistrationNoFormatResponse(),
      };
    }

    return {
      ok: false,
      logContext: {
        event: "duplicate_registration_no_payload",
        dogId: id,
        registrationCount: registration.registrationCount,
      },
      logMessage:
        "admin dog update rejected because duplicate registration numbers were provided",
      response: duplicateRegistrationNoResponse(),
    };
  }

  const sex = parseDogSex(input.sex);
  if (!sex) {
    return {
      ok: false,
      logContext: { event: "invalid_sex", dogId: id, sex: input.sex },
      logMessage: "admin dog update rejected because sex is invalid",
      response: invalidSexResponse(),
    };
  }

  const birthDate =
    input.birthDate === undefined ? undefined : parseBirthDate(input.birthDate);
  if (birthDate === "INVALID") {
    return {
      ok: false,
      logContext: {
        event: "invalid_birth_date",
        dogId: id,
        birthDate: input.birthDate,
      },
      logMessage: "admin dog update rejected because birth date is invalid",
      response: invalidBirthDateResponse(),
    };
  }

  const ekNo =
    input.ekNo === undefined ? undefined : parsePositiveInteger(input.ekNo);
  if (ekNo === "INVALID") {
    return {
      ok: false,
      logContext: { event: "invalid_ek_no", dogId: id, ekNo: input.ekNo },
      logMessage: "admin dog update rejected because EK number is invalid",
      response: invalidEkNoResponse(),
    };
  }

  const ekNoAssignedOn =
    input.ekNoAssignedOn === undefined
      ? undefined
      : parseBirthDate(input.ekNoAssignedOn);
  if (ekNoAssignedOn === "INVALID") {
    return {
      ok: false,
      logContext: {
        event: "invalid_ek_no_assigned_on",
        dogId: id,
        ekNoAssignedOn: input.ekNoAssignedOn,
      },
      logMessage:
        "admin dog update rejected because EK number assignment date is invalid",
      response: invalidEkNoAssignedOnResponse(),
    };
  }
  if (ekNoAssignedOn && isFutureBusinessDate(toDateOnly(ekNoAssignedOn))) {
    return {
      ok: false,
      logContext: {
        event: "future_ek_no_assigned_on",
        dogId: id,
        ekNoAssignedOn: toDateOnly(ekNoAssignedOn),
      },
      logMessage:
        "admin dog update rejected because EK number assignment date is in the future",
      response: invalidEkNoAssignedOnResponse(),
    };
  }

  const colorCode =
    input.colorCode === undefined
      ? undefined
      : parsePositiveInteger(input.colorCode);
  if (colorCode === "INVALID") {
    return {
      ok: false,
      logContext: {
        event: "invalid_color_code",
        dogId: id,
        colorCode: input.colorCode,
      },
      logMessage: "admin dog update rejected because color code is invalid",
      response: invalidColorCodeResponse(),
    };
  }

  return {
    ok: true,
    data: {
      id,
      status,
      name: name ?? registration.primaryRegistrationNo,
      sex,
      birthDate,
      ekNo,
      ekNoAssignedOn,
      colorCode,
      primaryRegistrationNo: registration.primaryRegistrationNo,
      secondaryRegistrationNos: registration.secondaryRegistrationNos,
      allRegistrationNos: registration.allRegistrationNos,
    },
  };
}

export function validateUpdateInTry(
  input: UpdateAdminDogRequest,
  id: string,
  maxNoteLength: number,
): UpdateInTryValidationResult {
  const note =
    input.note === undefined
      ? undefined
      : normalizeOptionalText(input.note ?? undefined);
  if (note !== undefined && note !== null && note.length > maxNoteLength) {
    return {
      ok: false,
      logContext: { event: "note_too_long", dogId: id },
      logMessage: "admin dog update rejected because note is too long",
      response: noteTooLongResponse(maxNoteLength),
    };
  }

  const parsedTitles =
    input.titles === undefined ? undefined : validateDogTitles(input.titles);
  if (parsedTitles !== undefined && !parsedTitles.ok) {
    return {
      ok: false,
      logContext: {
        event: "invalid_titles",
        dogId: id,
        code: parsedTitles.response.body.code,
      },
      logMessage: "admin dog update rejected because title rows are invalid",
      response: parsedTitles.response,
    };
  }

  return {
    ok: true,
    data: {
      note,
      breederNameText:
        input.breederNameText === undefined
          ? undefined
          : normalizeOptionalText(input.breederNameText ?? undefined),
      ownerNames:
        input.ownerNames === undefined
          ? undefined
          : normalizeDistinctNames(input.ownerNames),
      parsedTitles,
      sireRegistrationNo:
        input.sireRegistrationNo === undefined
          ? undefined
          : normalizeOptionalText(input.sireRegistrationNo ?? undefined),
      damRegistrationNo:
        input.damRegistrationNo === undefined
          ? undefined
          : normalizeOptionalText(input.damRegistrationNo ?? undefined),
    },
  };
}
