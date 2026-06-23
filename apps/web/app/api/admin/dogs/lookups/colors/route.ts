import type { NextRequest } from "next/server";
import { listAdminDogColorOptions } from "@beagle/server";
import { getSessionCurrentUser } from "@/lib/server/current-user";
import { toAdminUserContext } from "@/lib/server/admin-user-context";
import { jsonResponse, optionsResponse } from "@/lib/server/cors";

export async function OPTIONS(request: NextRequest) {
  return optionsResponse("GET,OPTIONS", {
    origin: request.headers.get("origin"),
  });
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSessionCurrentUser();
    const result = await listAdminDogColorOptions(
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
        error: "Failed to load dog color options.",
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
