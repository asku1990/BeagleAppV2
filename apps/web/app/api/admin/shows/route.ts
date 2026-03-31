import type { AdminShowSearchRequest } from "@beagle/contracts";
import { listAdminShowEvents } from "@beagle/server";
import { NextRequest } from "next/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

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
  const currentUser = await getSessionCurrentUser();
  const query = request.nextUrl.searchParams.get("query") ?? undefined;
  const page = parseOptionalNumber(request.nextUrl.searchParams.get("page"));
  const pageSize = parseOptionalNumber(
    request.nextUrl.searchParams.get("pageSize"),
  );
  const sort = request.nextUrl.searchParams.get("sort") ?? undefined;

  const result = await listAdminShowEvents(
    {
      query,
      page,
      pageSize,
      sort: sort as AdminShowSearchRequest["sort"] | string | undefined,
    },
    currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.name,
          role: currentUser.role,
        }
      : null,
  );

  return jsonResponse(result.body, {
    status: result.status,
    methods: "GET,OPTIONS",
    origin: request.headers.get("origin"),
  });
}
