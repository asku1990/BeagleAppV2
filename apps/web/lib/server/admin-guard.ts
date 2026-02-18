import { betterAuth, requireAdmin } from "@beagle/server";
import type { CurrentUserDto } from "@beagle/contracts";
import { headers } from "next/headers";
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

async function getAdminCheck(requestHeaders: Headers) {
  const session = await betterAuth.api.getSession({
    headers: requestHeaders,
  });
  const currentUser = session?.user ? toCurrentUser(session.user) : null;
  return requireAdmin(currentUser);
}

export async function requireAdminAccess(
  request: NextRequest,
  methods: string,
): Promise<AdminAccessResult> {
  const adminCheck = await getAdminCheck(request.headers);

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

export async function requireAdminLayoutAccess(): Promise<
  { ok: true } | { ok: false; status: number }
> {
  const adminCheck = await getAdminCheck(await headers());

  if (!adminCheck.body.ok) {
    return { ok: false, status: adminCheck.status };
  }

  return { ok: true };
}
