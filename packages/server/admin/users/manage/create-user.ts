import { hashPassword } from "better-auth/crypto";
import {
  createAdminUserDb,
  runAdminUserWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import {
  normalizeAndValidateEmailAddress,
  normalizeAndValidatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type CreateAdminUserRequest,
  type CreateAdminUserResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../../../shared/result";

function normalizeEmail(email: string): string | null {
  return normalizeAndValidateEmailAddress(email);
}

function normalizeName(name: string | null | undefined): string | null {
  const normalized = name?.trim();
  return normalized ? normalized : null;
}

function parseRole(role: string): "USER" | "ADMIN" | null {
  if (role === "ADMIN") {
    return "ADMIN";
  }
  if (role === "USER") {
    return "USER";
  }
  return null;
}

function isDuplicateEmailError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error as { code?: string }).code === "P2002",
  );
}

export async function createAdminUser(
  input: CreateAdminUserRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<CreateAdminUserResponse>> {
  const email = normalizeEmail(input.email);
  if (!email) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Email must be a valid email address.",
        code: "INVALID_EMAIL",
      },
    };
  }

  const password = normalizeAndValidatePassword(input.password);
  if (!password) {
    return {
      status: 400,
      body: {
        ok: false,
        error: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
        code: "INVALID_PASSWORD",
      },
    };
  }

  const role = parseRole(input.role);
  if (!role) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Role must be either USER or ADMIN.",
        code: "INVALID_ROLE",
      },
    };
  }

  try {
    const created = await runAdminUserWriteTransactionDb(
      async (tx) => {
        const passwordHash = await hashPassword(password);
        return createAdminUserDb(
          {
            email,
            name: normalizeName(input.name),
            role,
            passwordHash,
          },
          tx,
        );
      },
      { ...auditContext, intent: "CREATE_USER" },
    );

    return {
      status: 201,
      body: {
        ok: true,
        data: {
          id: created.id,
          email: created.email,
          name: created.name,
          role: created.role === "ADMIN" ? "ADMIN" : "USER",
          status: created.banned ? "suspended" : "active",
          createdAt: created.createdAt.toISOString(),
        },
      },
    };
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return {
        status: 409,
        body: {
          ok: false,
          error: "User with this email already exists.",
          code: "EMAIL_EXISTS",
        },
      };
    }

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to create user.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
