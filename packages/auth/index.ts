import type { Role } from "@beagle/db";
import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

export type AuthzResult =
  | { ok: true; userId: string; role: "USER" | "ADMIN" }
  | { ok: false; reason: "UNAUTHENTICATED" | "FORBIDDEN" };

const scrypt = promisify(nodeScrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(hash: string, password: string) {
  const [scheme, salt, expectedHex] = hash.split("$");
  if (scheme !== "scrypt" || !salt || !expectedHex) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const candidate = (await scrypt(password, salt, expected.length)) as Buffer;
  return timingSafeEqual(expected, candidate);
}

export function authorizeRole(user: { id: string; role: Role } | null, required: Role): AuthzResult {
  if (!user) return { ok: false, reason: "UNAUTHENTICATED" };
  if (user.role !== required) return { ok: false, reason: "FORBIDDEN" };
  return { ok: true, userId: user.id, role: user.role };
}
