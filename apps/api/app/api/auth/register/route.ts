import { hashPassword } from "@beagle/auth";
import { createUser, findUserByEmail, Role } from "@beagle/db";
import { jsonResponse, optionsResponse } from "@/lib/cors";

export async function OPTIONS() {
  return optionsResponse("POST,OPTIONS");
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    username?: string;
  };
  const email = body.email?.trim().toLowerCase();

  if (!email || !body.password) {
    return jsonResponse(
      { ok: false, error: "Email and password are required." },
      { status: 400 },
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return jsonResponse(
      { ok: false, error: "Email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(body.password);
  const user = await createUser({
    email,
    username: body.username?.trim() || undefined,
    passwordHash,
    role: Role.USER,
  });

  return jsonResponse(
    { ok: true, data: { id: user.id, email: user.email, role: user.role } },
    { status: 201 },
  );
}
