import { listAdminUsersDb } from "@beagle/db";
import type { AdminUsersResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../../shared/result";

function toUserRole(role: string): "ADMIN" | "USER" {
  return role === "ADMIN" ? "ADMIN" : "USER";
}

export async function listAdminUsers(): Promise<
  ServiceResult<AdminUsersResponse>
> {
  try {
    const users = await listAdminUsersDb();

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          items: users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: toUserRole(user.role),
            status: user.banned ? "suspended" : "active",
            createdAt: user.createdAt.toISOString(),
            lastSignInAt: user.lastSignInAt?.toISOString() ?? null,
          })),
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin users.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
