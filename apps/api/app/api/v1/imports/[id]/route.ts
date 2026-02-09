import { authService, importsService, requireAdmin } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("GET,OPTIONS");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const sessionToken = request.cookies.get("beagle_session")?.value;
  const currentUser = await authService.getUserFromSessionToken(sessionToken);
  const adminCheck = requireAdmin(currentUser);
  if (!adminCheck.body.ok) {
    return jsonResponse(adminCheck.body, {
      status: adminCheck.status,
      methods: "GET,OPTIONS",
    });
  }

  const { id } = await context.params;
  const result = await importsService.getImportRun(id);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
  });
}
