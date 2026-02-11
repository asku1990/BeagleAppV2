import type { CurrentUserDto } from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";
import { hasAdminRole } from "../shared/types";

export function requireAdmin(
  user: CurrentUserDto | null,
): ServiceResult<{ authorized: true }> {
  if (!user) {
    return {
      status: 401,
      body: { ok: false, error: "Not authenticated.", code: "UNAUTHENTICATED" },
    };
  }

  if (!hasAdminRole(user)) {
    return {
      status: 403,
      body: { ok: false, error: "Admin role required.", code: "FORBIDDEN" },
    };
  }

  return {
    status: 200,
    body: { ok: true, data: { authorized: true } },
  };
}
