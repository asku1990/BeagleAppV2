import { type NextRequest } from "next/server";
import { listAdminTrials } from "@beagle/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import type { AdminTrialSearchSort } from "@beagle/contracts";

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSessionCurrentUser();
    const query = request.nextUrl.searchParams.get("query") ?? undefined;
    const page = parseOptionalNumber(request.nextUrl.searchParams.get("page"));
    const pageSize = parseOptionalNumber(
      request.nextUrl.searchParams.get("pageSize"),
    );
    const sort = request.nextUrl.searchParams.get("sort") ?? undefined;

    const result = await listAdminTrials(
      {
        query,
        page,
        pageSize,
        sort: sort as AdminTrialSearchSort | undefined,
      },
      toAdminUserContext(currentUser),
    );

    return jsonResponse(result.body, {
      status: result.status,
      methods: "GET,OPTIONS",
      origin: request.headers.get("origin"),
    });
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Failed to load admin trials.",
        code: "INTERNAL_ERROR",
      },
      {
        status: 500,
        methods: "GET,OPTIONS",
        origin: request.headers.get("origin"),
      },
    );
  }
}
