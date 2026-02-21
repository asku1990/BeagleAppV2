import { hashPassword } from "better-auth/crypto";
import {
  getAdminUserByIdDb,
  setAdminUserPasswordDb,
  type AuditContextDb,
} from "@beagle/db";
import {
  normalizeAndValidatePassword,
  type SetAdminUserPasswordRequest,
  type SetAdminUserPasswordResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";

export async function setAdminUserPassword(
  input: SetAdminUserPasswordRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<SetAdminUserPasswordResponse>> {
  if (!input.userId.trim()) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "User id is required.",
        code: "INVALID_USER_ID",
      },
    };
  }

  const normalizedPassword = normalizeAndValidatePassword(input.newPassword);
  if (!normalizedPassword) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Password does not meet length requirements.",
        code: "INVALID_PASSWORD",
      },
    };
  }

  try {
    const target = await getAdminUserByIdDb(input.userId);
    if (!target) {
      return {
        status: 404,
        body: {
          ok: false,
          error: "User not found.",
          code: "NOT_FOUND",
        },
      };
    }

    const passwordHash = await hashPassword(normalizedPassword);
    await setAdminUserPasswordDb(
      {
        userId: input.userId,
        passwordHash,
      },
      auditContext,
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          userId: input.userId,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to set user password.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
