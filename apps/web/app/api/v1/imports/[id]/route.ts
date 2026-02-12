import { importsService } from "@beagle/server";
import { NextRequest } from "next/server";
import { requireAdminAccess } from "@/lib/server/admin-guard";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

// Access policy: admin-only route.
export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const adminAccess = await requireAdminAccess(request, "GET,OPTIONS");
  if (!adminAccess.ok) {
    return adminAccess.response;
  }

  const { id } = await context.params;
  const result = await importsService.getImportRun(id);
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
