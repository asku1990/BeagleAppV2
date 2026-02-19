import { hashPassword } from "better-auth/crypto";
import { createAdminUserDb } from "@beagle/db";
import {
  normalizeAndValidateEmailAddress,
  normalizeAndValidatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  type CreateAdminUserRequest,
  type CreateAdminUserResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";

function normalizeEmail(email: string): string | null {
  return normalizeAndValidateEmailAddress(email);
}

function normalizeName(name: string | null | undefined): string | null {
  const normalized = name?.trim();
  return normalized ? normalized : null;
}

function normalizeRole(role: string | undefined): "USER" | "ADMIN" {
  return role === "USER" ? "USER" : "ADMIN";
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

  try {
    const passwordHash = await hashPassword(password);
    const created = await createAdminUserDb({
      email,
      name: normalizeName(input.name),
      role: normalizeRole(input.role),
      passwordHash,
    });

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
