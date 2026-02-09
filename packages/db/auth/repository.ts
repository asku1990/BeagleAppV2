import { Role } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { prisma } from "../core/prisma";

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
  const now = new Date();

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
      createdAt: now,
      updatedAt: now,
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
