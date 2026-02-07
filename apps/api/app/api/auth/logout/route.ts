import { deleteSession } from "@beagle/db";
import { NextRequest } from "next/server";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("beagle_session")?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  const response = jsonResponse({ ok: true }, { methods: "POST,OPTIONS" });
  response.cookies.set("beagle_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
