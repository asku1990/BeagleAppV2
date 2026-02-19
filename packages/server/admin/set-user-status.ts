import { getAdminUserByIdDb, setAdminUserStatusDb } from "@beagle/db";
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

    await setAdminUserStatusDb({
      userId: input.userId,
      status: input.status,
    });
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
