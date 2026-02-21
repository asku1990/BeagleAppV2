import {
  type AuditContextDb,
  countAdminUsersDb,
  deleteAdminUserDb,
  getAdminUserByIdDb,
  lockAdminUsersForUpdateDb,
  runAdminUserWriteTransactionDb,
} from "@beagle/db";
import type { DeleteAdminUserResponse } from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";

type DeleteAdminUserInput = {
  userId: string;
  currentUserId: string;
  auditContext?: AuditContextDb;
};

export async function deleteAdminUser(
  input: DeleteAdminUserInput,
): Promise<ServiceResult<DeleteAdminUserResponse>> {
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

  if (input.userId === input.currentUserId) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "Cannot delete the currently signed-in admin.",
        code: "CANNOT_DELETE_SELF",
      },
    };
  }

  try {
    const deleteResult = await runAdminUserWriteTransactionDb(async (tx) => {
      const target = await getAdminUserByIdDb(input.userId, tx);
      if (!target) {
        return { kind: "NOT_FOUND" } as const;
      }

      if (target.role === "ADMIN") {
        await lockAdminUsersForUpdateDb(tx);
        const adminCount = await countAdminUsersDb(tx);
        if (adminCount <= 1) {
          return { kind: "LAST_ADMIN" } as const;
        }
      }

      const deleted = await deleteAdminUserDb(input.userId, tx);
      if (!deleted) {
        return { kind: "NOT_FOUND" } as const;
      }

      return { kind: "DELETED" } as const;
    }, input.auditContext);

    if (deleteResult.kind === "NOT_FOUND") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "User not found.",
          code: "NOT_FOUND",
        },
      };
    }

    if (deleteResult.kind === "LAST_ADMIN") {
      return {
        status: 409,
        body: {
          ok: false,
          error: "Cannot delete the last admin user.",
          code: "LAST_ADMIN",
        },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          deletedUserId: input.userId,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete user.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
