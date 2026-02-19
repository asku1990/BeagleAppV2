import { betterAuth } from "@beagle/server";
import { headers } from "next/headers";

export type SessionCurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  createdAt: string | null;
};

export async function getSessionCurrentUser(): Promise<SessionCurrentUser | null> {
  const session = await betterAuth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user?.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role === "ADMIN" ? "ADMIN" : "USER",
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
  };
}
