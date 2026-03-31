import { getAdminShowEvent } from "@beagle/server";
import { NextRequest } from "next/server";
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
  const { showId } = await context.params;
  const currentUser = await getSessionCurrentUser();
  const result = await getAdminShowEvent(
    { showId },
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
