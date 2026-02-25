import {
  runAdminDogWriteTransactionDb,
  updateAdminDogWriteDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../shared/logger";
import type { ServiceResult } from "../../shared/result";

function normalizeRequiredId(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeRequiredName(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeOptionalText(value: string | undefined): string | null {
  const normalized = (value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeOwnerNames(value: string[] | undefined): string[] {
  const seen = new Set<string>();
  for (const rawName of value ?? []) {
    const normalized = rawName.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
  }

  return Array.from(seen);
}

function parseSex(value: string): "MALE" | "FEMALE" | "UNKNOWN" | null {
  if (value === "MALE" || value === "FEMALE" || value === "UNKNOWN") {
    return value;
  }

  return null;
}

function parseBirthDate(value: string | undefined): Date | null | "INVALID" {
  const normalized = normalizeOptionalText(value);
  if (!normalized) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) {
    return "INVALID";
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return "INVALID";
  }

  return parsed;
}

function parseEkNo(value: number | undefined): number | null | "INVALID" {
  if (value === undefined) {
    return null;
  }

  if (!Number.isInteger(value) || value <= 0) {
    return "INVALID";
  }

  return value;
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
      ownerCount: normalizeOwnerNames(input.ownerNames).length,
    },
    "admin dog update started",
  );

  const id = normalizeRequiredId(input.id);
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

  const name = normalizeRequiredName(input.name);
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

  const sex = parseSex(input.sex);
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

  const birthDate = parseBirthDate(input.birthDate);
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

  const ekNo = parseEkNo(input.ekNo);
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
    const updatedDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        updateAdminDogWriteDb(
          {
            id,
            name,
            sex,
            birthDate,
            breederNameText: normalizeOptionalText(input.breederNameText),
            ownerNames: normalizeOwnerNames(input.ownerNames),
            ekNo,
            note: normalizeOptionalText(input.note),
            registrationNo: normalizeOptionalText(input.registrationNo),
            sireRegistrationNo: normalizeOptionalText(input.sireRegistrationNo),
            damRegistrationNo: normalizeOptionalText(input.damRegistrationNo),
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
