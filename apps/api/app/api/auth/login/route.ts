import { verifyPassword } from "@beagle/auth";
import { createSession, findUserByEmail } from "@beagle/db";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.password) {
    return jsonResponse(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return jsonResponse(
      { ok: false, error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const validPassword = await verifyPassword(user.passwordHash, body.password);
  if (!validPassword) {
    return jsonResponse(
      { ok: false, error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const session = await createSession(user.id);
  const response = jsonResponse({
    ok: true,
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });

  response.cookies.set("beagle_session", session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expires,
    path: "/",
  });

  return response;
}
