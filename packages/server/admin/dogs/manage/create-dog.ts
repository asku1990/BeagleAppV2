import {
  createAdminDogWriteDb,
  findDogByRegistrationNoDb,
  runAdminDogWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  CreateAdminDogRequest,
  CreateAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../../shared/logger";
import type { ServiceResult } from "../../../shared/result";
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

function isDuplicateError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002",
  );
}

async function resolveParentByRegistration(
  registrationNo: string | null,
): Promise<{ id: string; sex: "MALE" | "FEMALE" | "UNKNOWN" } | null> {
  if (!registrationNo) {
    return null;
  }

  const row = await findDogByRegistrationNoDb(registrationNo);
  if (!row) {
    return null;
  }

  return { id: row.id, sex: row.sex };
}

export async function createAdminDog(
  input: CreateAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<CreateAdminDogResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.createAdminDog",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info(
    {
      event: "start",
      sex: input.sex,
      hasBirthDate: Boolean(input.birthDate),
      hasRegistrationNo: Boolean(input.registrationNo),
      ownerCount: normalizeDistinctNames(input.ownerNames).length,
    },
    "admin dog create started",
  );

  const name = normalizeRequiredText(input.name);
  if (!name) {
    log.warn(
      { event: "invalid_name", durationMs: Date.now() - startedAt },
      "admin dog create rejected because name is invalid",
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
      { event: "name_too_long", durationMs: Date.now() - startedAt },
      "admin dog create rejected because name is too long",
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

  const sex = parseDogSex(input.sex);
  if (!sex) {
    log.warn(
      {
        event: "invalid_sex",
        sex: input.sex,
        durationMs: Date.now() - startedAt,
      },
      "admin dog create rejected because sex is invalid",
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

  const birthDate = parseBirthDate(input.birthDate);
  if (birthDate === "INVALID") {
    log.warn(
      {
        event: "invalid_birth_date",
        birthDate: input.birthDate,
        durationMs: Date.now() - startedAt,
      },
      "admin dog create rejected because birth date is invalid",
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

  const ekNo = parsePositiveInteger(input.ekNo);
  if (ekNo === "INVALID") {
    log.warn(
      {
        event: "invalid_ek_no",
        ekNo: input.ekNo,
        durationMs: Date.now() - startedAt,
      },
      "admin dog create rejected because EK number is invalid",
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

  const registrationNo = normalizeRequiredText(input.registrationNo);
  if (!registrationNo) {
    log.warn(
      {
        event: "invalid_registration_no",
        durationMs: Date.now() - startedAt,
      },
      "admin dog create rejected because registration number is invalid",
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
        durationMs: Date.now() - startedAt,
      },
      "admin dog create rejected because registration number is invalid",
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

  try {
    if (
      allRegistrationNos.some(
        (value) => !hasMaxLength(value, DOG_REGISTRATION_NO_MAX_LENGTH),
      )
    ) {
      log.warn(
        {
          event: "registration_no_too_long",
          registrationCount: allRegistrationNos.length,
          durationMs: Date.now() - startedAt,
        },
        "admin dog create rejected because registration number is too long",
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
          registrationCount: allRegistrationNos.length,
          durationMs: Date.now() - startedAt,
        },
        "admin dog create rejected because registration number format is invalid",
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
          registrationCount: allRegistrationNos.length,
          durationMs: Date.now() - startedAt,
        },
        "admin dog create rejected because duplicate registration numbers were provided",
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

    const note = normalizeOptionalText(input.note);
    if (!hasMaxLength(note, DOG_NOTE_MAX_LENGTH)) {
      log.warn(
        { event: "note_too_long", durationMs: Date.now() - startedAt },
        "admin dog create rejected because note is too long",
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

    const sireRegistrationNo = normalizeOptionalText(input.sireRegistrationNo);
    const damRegistrationNo = normalizeOptionalText(input.damRegistrationNo);

    const sire = await resolveParentByRegistration(sireRegistrationNo);
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

    const dam = await resolveParentByRegistration(damRegistrationNo);
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

    if (sire && dam && sire.id === dam.id) {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Sire and dam must be different dogs.",
          code: "INVALID_PARENT_COMBINATION",
        },
      };
    }

    if (sire && sire.sex !== "MALE") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Selected sire must be a male dog.",
          code: "INVALID_SIRE_SEX",
        },
      };
    }

    if (dam && dam.sex !== "FEMALE") {
      return {
        status: 400,
        body: {
          ok: false,
          error: "Selected dam must be a female dog.",
          code: "INVALID_DAM_SEX",
        },
      };
    }

    const createdDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        createAdminDogWriteDb(
          {
            name,
            sex,
            birthDate,
            breederNameText: normalizeOptionalText(input.breederNameText),
            sireId: sire?.id ?? null,
            damId: dam?.id ?? null,
            ownerNames: normalizeDistinctNames(input.ownerNames),
            ekNo,
            note,
            registrationNo: normalizedPrimaryRegistrationNo,
            secondaryRegistrationNos,
          },
          tx,
        ),
      { ...auditContext, intent: "CREATE_DOG" },
    );

    log.info(
      {
        event: "success",
        dogId: createdDog.id,
        durationMs: Date.now() - startedAt,
      },
      "admin dog create succeeded",
    );

    return {
      status: 201,
      body: {
        ok: true,
        data: {
          id: createdDog.id,
          name: createdDog.name,
          sex: createdDog.sex,
          registrationNo: createdDog.registrationNo,
        },
      },
    };
  } catch (error) {
    if (isDuplicateError(error)) {
      log.warn(
        { event: "duplicate_dog", durationMs: Date.now() - startedAt },
        "admin dog create rejected because duplicate dog exists",
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
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog create failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to create dog.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
