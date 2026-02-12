import { importsService } from "@beagle/server";
import { NextRequest } from "next/server";
import { requireAdminAccess } from "@/lib/admin-guard";
import { jsonResponse, optionsResponse } from "@/lib/cors";

function parseSeverity(
  raw: string | null,
): "INFO" | "WARNING" | "ERROR" | undefined {
  if (raw === "INFO" || raw === "WARNING" || raw === "ERROR") {
    return raw;
  }
  return undefined;
}

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
  const stage = request.nextUrl.searchParams.get("stage") ?? undefined;
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const severityRaw = request.nextUrl.searchParams.get("severity");
  const severity = parseSeverity(severityRaw);
  if (severityRaw && !severity) {
    return jsonResponse(
      { ok: false, error: "Invalid severity. Use INFO, WARNING, or ERROR." },
      {
        status: 400,
        methods: "GET,OPTIONS",
        origin: request.headers.get("origin"),
      },
    );
  }
  const cursor = request.nextUrl.searchParams.get("cursor") ?? undefined;
  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;

  const result = await importsService.getImportRunIssues(id, {
    stage,
    code,
    severity,
    cursor,
    limit: Number.isFinite(limit) ? limit : undefined,
  });
  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
