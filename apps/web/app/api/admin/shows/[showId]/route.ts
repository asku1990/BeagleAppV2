import { getAdminShowEvent } from "@beagle/server";
import { NextRequest } from "next/server";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ showId: string }> },
) {
  try {
    const { showId } = await context.params;
    const currentUser = await getSessionCurrentUser();
    const result = await getAdminShowEvent(
      { showId },
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
        error: "Failed to load admin show details.",
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
