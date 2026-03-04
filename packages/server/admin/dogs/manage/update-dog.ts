import {
  findDogByIdDb,
  findDogByRegistrationNoDb,
  runAdminDogWriteTransactionDb,
  updateAdminDogWriteDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../../core/logger";
import type { ServiceResult } from "../../../core/result";
import { parseDogId } from "../../../dogs/core";
import {
  hasMaxLength,
  isValidRegistrationNo,
  normalizeDistinctNames,
  normalizeOptionalText,
  normalizeRegistrationNo,
  normalizeRegistrationNos,
  normalizeRequiredText,
  parseBirthDate,
  parseDogSex,
  parsePositiveInteger,
} from "./normalization";

const DOG_NAME_MAX_LENGTH = 120;
const DOG_REGISTRATION_NO_MAX_LENGTH = 40;
const DOG_NOTE_MAX_LENGTH = 500;
type ParentRef = { id: string; sex: "MALE" | "FEMALE" | "UNKNOWN" };

async function resolveParentByRegistration(
  registrationNo: string | null,
): Promise<ParentRef | null> {
  if (!registrationNo) {
    return null;
  }

  const row = await findDogByRegistrationNoDb(registrationNo);
  if (!row) {
    return null;
  }

  return { id: row.id, sex: row.sex };
}

function isDuplicateError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002",
  );
}

function isDogNotFoundError(error: unknown): boolean {
  return error instanceof Error && error.message === "DOG_NOT_FOUND";
}

export async function updateAdminDog(
  input: UpdateAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<UpdateAdminDogResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.updateAdminDog",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info(
    {
      event: "start",
      dogId: input.id,
      sex: input.sex,
      hasBirthDate: Boolean(input.birthDate),
      hasRegistrationNo: Boolean(input.registrationNo),
      hasOwnerNames: input.ownerNames !== undefined,
      ownerCount: normalizeDistinctNames(input.ownerNames).length,
    },
    "admin dog update started",
  );

  const id = parseDogId(input.id);
  if (!id) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "admin dog update rejected because dog id is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Dog id is required.",
        code: "INVALID_DOG_ID",
      },
    };
  }

  const name = normalizeRequiredText(input.name);
  if (!name) {
    log.warn(
      { event: "invalid_name", dogId: id, durationMs: Date.now() - startedAt },
      "admin dog update rejected because name is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Name is required.",
        code: "INVALID_NAME",
      },
    };
  }
  if (!hasMaxLength(name, DOG_NAME_MAX_LENGTH)) {
    log.warn(
      { event: "name_too_long", dogId: id, durationMs: Date.now() - startedAt },
      "admin dog update rejected because name is too long",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: `Name cannot exceed ${DOG_NAME_MAX_LENGTH} characters.`,
        code: "NAME_TOO_LONG",
      },
    };
  }

  const registrationNo = normalizeRequiredText(input.registrationNo);
  if (!registrationNo) {
    log.warn(
      {
        event: "invalid_registration_no",
        dogId: id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because registration number is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Registration number is required.",
        code: "INVALID_REGISTRATION_NO",
      },
    };
  }
  const normalizedPrimaryRegistrationNo =
    normalizeRegistrationNo(registrationNo);
  if (!normalizedPrimaryRegistrationNo) {
    log.warn(
      {
        event: "invalid_registration_no",
        dogId: id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because registration number is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Registration number is required.",
        code: "INVALID_REGISTRATION_NO",
      },
    };
  }
  const secondaryRegistrationNos = normalizeRegistrationNos(
    input.secondaryRegistrationNos,
  );
  const allRegistrationNos = [
    normalizedPrimaryRegistrationNo,
    ...secondaryRegistrationNos,
  ];
  if (
    allRegistrationNos.some(
      (value) => !hasMaxLength(value, DOG_REGISTRATION_NO_MAX_LENGTH),
    )
  ) {
    log.warn(
      {
        event: "registration_no_too_long",
        dogId: id,
        registrationCount: allRegistrationNos.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because registration number is too long",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: `Registration number cannot exceed ${DOG_REGISTRATION_NO_MAX_LENGTH} characters.`,
        code: "REGISTRATION_NO_TOO_LONG",
      },
    };
  }
  if (allRegistrationNos.some((value) => !isValidRegistrationNo(value))) {
    log.warn(
      {
        event: "invalid_registration_no_format",
        dogId: id,
        registrationCount: allRegistrationNos.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because registration number format is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Registration number format is invalid.",
        code: "INVALID_REGISTRATION_NO",
      },
    };
  }
  if (new Set(allRegistrationNos).size !== allRegistrationNos.length) {
    log.warn(
      {
        event: "duplicate_registration_no_payload",
        dogId: id,
        registrationCount: allRegistrationNos.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because duplicate registration numbers were provided",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Registration numbers must be unique.",
        code: "DUPLICATE_REGISTRATION_NO",
      },
    };
  }

  const sex = parseDogSex(input.sex);
  if (!sex) {
    log.warn(
      {
        event: "invalid_sex",
        dogId: id,
        sex: input.sex,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because sex is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid sex value.",
        code: "INVALID_SEX",
      },
    };
  }

  const birthDate =
    input.birthDate === undefined ? undefined : parseBirthDate(input.birthDate);
  if (birthDate === "INVALID") {
    log.warn(
      {
        event: "invalid_birth_date",
        dogId: id,
        birthDate: input.birthDate,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because birth date is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Birth date must use YYYY-MM-DD format.",
        code: "INVALID_BIRTH_DATE",
      },
    };
  }

  const ekNo =
    input.ekNo === undefined ? undefined : parsePositiveInteger(input.ekNo);
  if (ekNo === "INVALID") {
    log.warn(
      {
        event: "invalid_ek_no",
        dogId: id,
        ekNo: input.ekNo,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update rejected because EK number is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "EK number must be a positive integer.",
        code: "INVALID_EK_NO",
      },
    };
  }

  try {
    const note =
      input.note === undefined
        ? undefined
        : normalizeOptionalText(input.note ?? undefined);
    if (note !== undefined && !hasMaxLength(note, DOG_NOTE_MAX_LENGTH)) {
      log.warn(
        {
          event: "note_too_long",
          dogId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog update rejected because note is too long",
      );
      return {
        status: 400,
        body: {
          ok: false,
          error: `Note cannot exceed ${DOG_NOTE_MAX_LENGTH} characters.`,
          code: "NOTE_TOO_LONG",
        },
      };
    }

    const breederNameText =
      input.breederNameText === undefined
        ? undefined
        : normalizeOptionalText(input.breederNameText ?? undefined);

    const sireRegistrationNo =
      input.sireRegistrationNo === undefined
        ? undefined
        : normalizeOptionalText(input.sireRegistrationNo ?? undefined);
    const damRegistrationNo =
      input.damRegistrationNo === undefined
        ? undefined
        : normalizeOptionalText(input.damRegistrationNo ?? undefined);

    let sire: ParentRef | null | undefined;
    if (sireRegistrationNo !== undefined) {
      sire = await resolveParentByRegistration(sireRegistrationNo);
    }
    if (sireRegistrationNo && !sire) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Sire registration number was not found.",
          code: "INVALID_SIRE_REGISTRATION",
        },
      };
    }

    let dam: ParentRef | null | undefined;
    if (damRegistrationNo !== undefined) {
      dam = await resolveParentByRegistration(damRegistrationNo);
    }
    if (damRegistrationNo && !dam) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Dam registration number was not found.",
          code: "INVALID_DAM_REGISTRATION",
        },
      };
    }

    const existingDog = await findDogByIdDb(id);
    if (!existingDog) {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Dog not found.",
          code: "DOG_NOT_FOUND",
        },
      };
    }

    const effectiveSire: ParentRef | null =
      sire === undefined ? existingDog.sire : sire;
    const effectiveDam: ParentRef | null =
      dam === undefined ? existingDog.dam : dam;

    if (effectiveSire && effectiveDam && effectiveSire.id === effectiveDam.id) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Sire and dam must be different dogs.",
          code: "INVALID_PARENT_COMBINATION",
        },
      };
    }

    if (effectiveSire && effectiveSire.id === id) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Dog cannot be its own sire.",
          code: "INVALID_SELF_PARENT",
        },
      };
    }

    if (effectiveDam && effectiveDam.id === id) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Dog cannot be its own dam.",
          code: "INVALID_SELF_PARENT",
        },
      };
    }

    if (effectiveSire && effectiveSire.sex !== "MALE") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Selected sire must be a male dog.",
          code: "INVALID_SIRE_SEX",
        },
      };
    }

    if (effectiveDam && effectiveDam.sex !== "FEMALE") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Selected dam must be a female dog.",
          code: "INVALID_DAM_SEX",
        },
      };
    }

    const updatedDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        updateAdminDogWriteDb(
          {
            id,
            name,
            sex,
            birthDate,
            breederNameText,
            sireId: sire === undefined ? undefined : (sire?.id ?? null),
            damId: dam === undefined ? undefined : (dam?.id ?? null),
            ownerNames:
              input.ownerNames === undefined
                ? undefined
                : normalizeDistinctNames(input.ownerNames),
            ekNo,
            note,
            registrationNo: normalizedPrimaryRegistrationNo,
            secondaryRegistrationNos:
              input.secondaryRegistrationNos === undefined
                ? undefined
                : secondaryRegistrationNos,
          },
          tx,
        ),
      { ...auditContext, intent: "UPDATE_DOG" },
    );

    log.info(
      {
        event: "success",
        dogId: updatedDog.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog update succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          id: updatedDog.id,
          name: updatedDog.name,
          sex: updatedDog.sex,
          registrationNo: updatedDog.registrationNo,
        },
      },
    };
  } catch (error) {
    if (isDogNotFoundError(error)) {
      log.warn(
        {
          event: "dog_not_found",
          dogId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog update failed because dog was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Dog not found.",
          code: "DOG_NOT_FOUND",
        },
      };
    }

    if (isDuplicateError(error)) {
      log.warn(
        {
          event: "duplicate_dog",
          dogId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog update rejected because duplicate dog exists",
      );
      return {
        status: 409,
        body: {
          ok: false,
          error:
            "Dog with same EK number or registration number already exists.",
          code: "DUPLICATE_DOG",
        },
      };
    }

    log.error(
      {
        event: "exception",
        dogId: id,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog update failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update dog.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
