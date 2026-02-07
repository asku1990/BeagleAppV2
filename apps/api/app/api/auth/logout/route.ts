import { authService } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("beagle_session")?.value;
  const result = await authService.logout(sessionToken);

  const response = jsonResponse(result.body, {
    status: result.status,
    methods: "POST,OPTIONS",
  });
  response.cookies.set("beagle_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
