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

function parseAdminPathCandidate(candidate: string | null): string | null {
  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("/admin")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const pathWithSearch = `${parsed.pathname}${parsed.search}`;
    if (pathWithSearch.startsWith("/admin")) {
      return pathWithSearch;
    }
  } catch {
    return null;
  }

  return null;
}

function resolveAdminReturnTo(requestHeaders: Headers): string {
  const fromNextUrl = parseAdminPathCandidate(requestHeaders.get("next-url"));
  if (fromNextUrl) {
    return fromNextUrl;
  }

  const fromReferer = parseAdminPathCandidate(requestHeaders.get("referer"));
  if (fromReferer) {
    return fromReferer;
  }

  return "/admin";
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
  { ok: true } | { ok: false; status: number; returnTo: string }
> {
  const requestHeaders = await headers();
  const adminCheck = await getAdminCheck(requestHeaders);

  if (!adminCheck.body.ok) {
    return {
      ok: false,
      status: adminCheck.status,
      returnTo: resolveAdminReturnTo(requestHeaders),
    };
  }

  return { ok: true };
}
