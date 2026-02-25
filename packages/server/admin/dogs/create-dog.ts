import {
  createAdminDogWriteDb,
  runAdminDogWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  CreateAdminDogRequest,
  CreateAdminDogResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../../shared/result";

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

export async function createAdminDog(
  input: CreateAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<CreateAdminDogResponse>> {
  const name = normalizeRequiredName(input.name);
  if (!name) {
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
    const createdDog = await runAdminDogWriteTransactionDb(
      async (tx) =>
        createAdminDogWriteDb(
          {
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
      { ...auditContext, intent: "CREATE_DOG" },
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
