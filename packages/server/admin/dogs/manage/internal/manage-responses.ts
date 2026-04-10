import type {
  CreateAdminDogResponse,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";

type CreateResult = ServiceResult<CreateAdminDogResponse>;
type UpdateResult = ServiceResult<UpdateAdminDogResponse>;
type ManageErrorTarget = CreateAdminDogResponse | UpdateAdminDogResponse;

type CreateDogSummary = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  registrationNo: string;
};

type UpdateDogSummary = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  registrationNo: string | null;
};

export function invalidDogIdResponse(): UpdateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dog id is required.",
      code: "INVALID_DOG_ID",
    },
  };
}

export function invalidNameResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Name is required.",
      code: "INVALID_NAME",
    },
  } as ServiceResult<T>;
}

export function nameTooLongResponse<T extends ManageErrorTarget>(
  maxLength: number,
): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: `Name cannot exceed ${maxLength} characters.`,
      code: "NAME_TOO_LONG",
    },
  } as ServiceResult<T>;
}

export function invalidSexResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Invalid sex value.",
      code: "INVALID_SEX",
    },
  } as ServiceResult<T>;
}

export function invalidBirthDateResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Birth date must use YYYY-MM-DD format.",
      code: "INVALID_BIRTH_DATE",
    },
  } as ServiceResult<T>;
}

export function invalidEkNoResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "EK number must be a positive integer.",
      code: "INVALID_EK_NO",
    },
  } as ServiceResult<T>;
}

export function invalidRegistrationNoResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Registration number is required.",
      code: "INVALID_REGISTRATION_NO",
    },
  } as ServiceResult<T>;
}

export function registrationNoTooLongResponse<T extends ManageErrorTarget>(
  maxLength: number,
): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: `Registration number cannot exceed ${maxLength} characters.`,
      code: "REGISTRATION_NO_TOO_LONG",
    },
  } as ServiceResult<T>;
}

export function invalidRegistrationNoFormatResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Registration number format is invalid.",
      code: "INVALID_REGISTRATION_NO",
    },
  } as ServiceResult<T>;
}

export function duplicateRegistrationNoResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Registration numbers must be unique.",
      code: "DUPLICATE_REGISTRATION_NO",
    },
  } as ServiceResult<T>;
}

export function noteTooLongResponse<T extends ManageErrorTarget>(
  maxLength: number,
): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: `Note cannot exceed ${maxLength} characters.`,
      code: "NOTE_TOO_LONG",
    },
  } as ServiceResult<T>;
}

export function invalidSireRegistrationResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire registration number was not found.",
      code: "INVALID_SIRE_REGISTRATION",
    },
  } as ServiceResult<T>;
}

export function invalidDamRegistrationResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dam registration number was not found.",
      code: "INVALID_DAM_REGISTRATION",
    },
  } as ServiceResult<T>;
}

export function invalidParentCombinationResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Sire and dam must be different dogs.",
      code: "INVALID_PARENT_COMBINATION",
    },
  } as ServiceResult<T>;
}

export function invalidSelfParentResponse(): UpdateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dog cannot be its own sire.",
      code: "INVALID_SELF_PARENT",
    },
  };
}

export function invalidSelfParentDamResponse(): UpdateResult {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Dog cannot be its own dam.",
      code: "INVALID_SELF_PARENT",
    },
  };
}

export function invalidSireSexResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected sire must be a male dog.",
      code: "INVALID_SIRE_SEX",
    },
  } as ServiceResult<T>;
}

export function invalidDamSexResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 400,
    body: {
      ok: false,
      error: "Selected dam must be a female dog.",
      code: "INVALID_DAM_SEX",
    },
  } as ServiceResult<T>;
}

export function dogNotFoundResponse(): UpdateResult {
  return {
    status: 404,
    body: {
      ok: false,
      error: "Dog not found.",
      code: "DOG_NOT_FOUND",
    },
  };
}

export function duplicateDogResponse<
  T extends ManageErrorTarget,
>(): ServiceResult<T> {
  return {
    status: 409,
    body: {
      ok: false,
      error: "Dog with same EK number or registration number already exists.",
      code: "DUPLICATE_DOG",
    },
  } as ServiceResult<T>;
}

export function createInternalErrorResponse(): CreateResult {
  return {
    status: 500,
    body: {
      ok: false,
      error: "Failed to create dog.",
      code: "INTERNAL_ERROR",
    },
  };
}

export function updateInternalErrorResponse(): UpdateResult {
  return {
    status: 500,
    body: {
      ok: false,
      error: "Failed to update dog.",
      code: "INTERNAL_ERROR",
    },
  };
}

export function createSuccessResponse(dog: CreateDogSummary): CreateResult {
  return {
    status: 201,
    body: {
      ok: true,
      data: {
        id: dog.id,
        name: dog.name,
        sex: dog.sex,
        registrationNo: dog.registrationNo,
      },
    },
  };
}

export function updateSuccessResponse(dog: UpdateDogSummary): UpdateResult {
  return {
    status: 200,
    body: {
      ok: true,
      data: {
        id: dog.id,
        name: dog.name,
        sex: dog.sex,
        registrationNo: dog.registrationNo,
      },
    },
  };
}
