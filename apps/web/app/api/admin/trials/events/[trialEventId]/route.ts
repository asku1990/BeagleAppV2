import { getAdminTrialEvent } from "@beagle/server";
import { type NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ trialEventId: string }> },
) {
  try {
    const { trialEventId } = await context.params;
    const currentUser = await getSessionCurrentUser();
    const result = await getAdminTrialEvent(
      { trialEventId },
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
        error: "Failed to load admin trial event details.",
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
