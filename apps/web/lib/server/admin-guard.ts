import { betterAuth, requireAdmin } from "@beagle/server";
import type { CurrentUserDto } from "@beagle/contracts";
import { type NextRequest } from "next/server";
import { jsonResponse } from "@/lib/server/cors";

type AdminAccessResult = { ok: true } | { ok: false; response: Response };

function toCurrentUser(user: {
  id?: string;
  email?: string;
  name?: string | null;
  role?: string | null;
}): CurrentUserDto | null {
  if (!user.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.name ?? null,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
  };
}

export async function requireAdminAccess(
  request: NextRequest,
  methods: string,
): Promise<AdminAccessResult> {
  const session = await betterAuth.api.getSession({
    headers: request.headers,
  });
  const currentUser = session?.user ? toCurrentUser(session.user) : null;
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
