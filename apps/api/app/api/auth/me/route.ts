import { findUserBySessionToken } from "@beagle/db";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("GET,OPTIONS");
}

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get("beagle_session")?.value;

  if (!sessionToken) {
    return jsonResponse(
      { ok: false, error: "Not authenticated." },
      { status: 401, methods: "GET,OPTIONS" },
    );
  }

  const user = await findUserBySessionToken(sessionToken);
  if (!user) {
    return jsonResponse(
      { ok: false, error: "Not authenticated." },
      { status: 401, methods: "GET,OPTIONS" },
    );
  }

  return jsonResponse(
    {
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    },
    { methods: "GET,OPTIONS" },
  );
}
