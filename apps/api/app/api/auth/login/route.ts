import { authService } from "@beagle/server";
import type { LoginRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  let body: Partial<LoginRequest>;
  try {
    body = (await request.json()) as Partial<LoginRequest>;
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid JSON body." },
      { status: 400, methods: "POST,OPTIONS" },
    );
  }
  const result = await authService.login(body);

  if (!result.body.ok || !result.session) {
    return jsonResponse(result.body, {
      status: result.status,
      methods: "POST,OPTIONS",
    });
  }

  const response = jsonResponse(result.body, {
    status: result.status,
    methods: "POST,OPTIONS",
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
