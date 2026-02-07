import { authService } from "@beagle/server";
import type { LoginRequest } from "@beagle/contracts";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<LoginRequest>;
  const result = await authService.login(body);

  if (!result.body.ok || !result.session) {
    return jsonResponse(result.body, { status: result.status });
  }

  const response = jsonResponse(result.body, { status: result.status });
  response.cookies.set("beagle_session", result.session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: result.session.expires,
    path: "/",
  });

  return response;
}
