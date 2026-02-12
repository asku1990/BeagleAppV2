import { authService } from "@beagle/server";
import type { LoginRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

// Access policy: public route.
export async function OPTIONS(request: Request) {
  return optionsResponse("POST,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let body: Partial<LoginRequest>;
  try {
    body = (await request.json()) as Partial<LoginRequest>;
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid JSON body." },
      { status: 400, methods: "POST,OPTIONS", origin },
    );
  }
  const result = await authService.login(body);

  if (!result.body.ok || !result.session) {
    return jsonResponse(result.body, {
      status: result.status,
      methods: "POST,OPTIONS",
      origin,
    });
  }

  const response = jsonResponse(result.body, {
    status: result.status,
    methods: "POST,OPTIONS",
    origin,
  });
  response.cookies.set("beagle_session", result.session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: result.session.expires,
    path: "/",
  });

  return response;
}
