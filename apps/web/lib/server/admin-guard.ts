import { authService, requireAdmin } from "@beagle/server";
import { type NextRequest } from "next/server";
import { jsonResponse } from "@/lib/server/cors";

type AdminAccessResult = { ok: true } | { ok: false; response: Response };

export async function requireAdminAccess(
  request: NextRequest,
  methods: string,
): Promise<AdminAccessResult> {
  const sessionToken = request.cookies.get("beagle_session")?.value;
  const currentUser = await authService.getUserFromSessionToken(sessionToken);
  const adminCheck = requireAdmin(currentUser);

  if (!adminCheck.body.ok) {
    return {
      ok: false,
      response: jsonResponse(adminCheck.body, {
        status: adminCheck.status,
        methods,
        origin: request.headers.get("origin"),
      }),
    };
  }

  return { ok: true };
}
