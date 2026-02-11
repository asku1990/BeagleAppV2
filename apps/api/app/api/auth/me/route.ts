import { authService } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("GET,OPTIONS");
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("beagle_session")?.value;
  const result = await authService.me(sessionToken);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
  });
}
