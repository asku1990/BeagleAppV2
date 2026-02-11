import { authService, importsService, requireAdmin } from "@beagle/server";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

function parseSeverity(
  raw: string | null,
): "INFO" | "WARNING" | "ERROR" | undefined {
  if (raw === "INFO" || raw === "WARNING" || raw === "ERROR") {
    return raw;
  }
  return undefined;
}

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
  const stage = request.nextUrl.searchParams.get("stage") ?? undefined;
  const code = request.nextUrl.searchParams.get("code") ?? undefined;
  const severityRaw = request.nextUrl.searchParams.get("severity");
  const severity = parseSeverity(severityRaw);
  if (severityRaw && !severity) {
    return jsonResponse(
      { ok: false, error: "Invalid severity. Use INFO, WARNING, or ERROR." },
      { status: 400, methods: "GET,OPTIONS" },
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
  });
}
