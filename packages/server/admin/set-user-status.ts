import {
  countActiveAdminUsersDb,
  getAdminUserByIdDb,
  lockAdminUsersForUpdateDb,
  runAdminUserWriteTransactionDb,
  setAdminUserStatusDb,
} from "@beagle/db";
import type {
  SetAdminUserStatusRequest,
  SetAdminUserStatusResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";

type SetAdminUserStatusInput = SetAdminUserStatusRequest & {
  currentUserId: string;
};

function isValidAdminUserStatus(
  status: string,
): status is SetAdminUserStatusRequest["status"] {
  return status === "active" || status === "suspended";
}

export async function setAdminUserStatus(
  input: SetAdminUserStatusInput,
): Promise<ServiceResult<SetAdminUserStatusResponse>> {
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

  if (!isValidAdminUserStatus(input.status)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Status must be either active or suspended.",
        code: "INVALID_STATUS",
      },
    };
  }

  if (input.userId === input.currentUserId && input.status === "suspended") {
    return {
      status: 409,
      body: {
        ok: false,
        error: "Cannot suspend the currently signed-in admin.",
        code: "CANNOT_SUSPEND_SELF",
      },
    };
  }

  try {
    const updateResult = await runAdminUserWriteTransactionDb(async (tx) => {
      const target = await getAdminUserByIdDb(input.userId, tx);
      if (!target) {
        return { kind: "NOT_FOUND" } as const;
      }

      if (input.status === "suspended" && target.role === "ADMIN") {
        await lockAdminUsersForUpdateDb(tx);
        const targetAfterLock = await getAdminUserByIdDb(input.userId, tx);
        if (!targetAfterLock) {
          return { kind: "NOT_FOUND" } as const;
        }

        if (!targetAfterLock.banned) {
          const activeAdminCount = await countActiveAdminUsersDb(tx);
          if (activeAdminCount <= 1) {
            return { kind: "LAST_ACTIVE_ADMIN" } as const;
          }
        }
      }

      await setAdminUserStatusDb(
        {
          userId: input.userId,
          status: input.status,
        },
        tx,
      );

      return { kind: "UPDATED" } as const;
    });

    if (updateResult.kind === "NOT_FOUND") {
      return {
        status: 404,
        body: {
          ok: false,
          error: "User not found.",
          code: "NOT_FOUND",
        },
      };
    }

    if (updateResult.kind === "LAST_ACTIVE_ADMIN") {
      return {
        status: 409,
        body: {
          ok: false,
          error: "Cannot suspend the last active admin user.",
          code: "LAST_ACTIVE_ADMIN",
        },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          userId: input.userId,
          status: input.status,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to update user status.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
