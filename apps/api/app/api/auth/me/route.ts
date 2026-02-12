import { authService } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

// Access policy: authenticated route.
export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("beagle_session")?.value;
  const result = await authService.me(sessionToken);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
