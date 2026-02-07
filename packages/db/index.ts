import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, Role, type User } from "@prisma/client";
import { config as loadEnv } from "dotenv";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(thisDir, "../../.env") });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const databaseUrl =
  process.env.DATABASE_URL ??
  "mysql://root:password@127.0.0.1:3306/beagle_db_v2";
const adapter = new PrismaMariaDb(databaseUrl);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { Role };
export type { User };

export async function createUser(input: {
  email: string;
  username?: string;
  passwordHash: string;
  role?: Role;
}) {
  return prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash: input.passwordHash,
      role: input.role ?? Role.USER,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createSession(userId: string, ttlDays = 30) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return { sessionToken, expires };
}

export async function findUserBySessionToken(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expires < new Date()) {
    await prisma.session.deleteMany({ where: { sessionToken } });
    return null;
  }

  return session.user;
}

export async function deleteSession(sessionToken: string) {
  await prisma.session.deleteMany({ where: { sessionToken } });
}
