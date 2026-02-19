import { randomUUID } from "node:crypto";
import { prisma } from "../core/prisma";

type CreateAdminUserDbInput = {
  email: string;
  name: string | null;
  role: "USER" | "ADMIN";
  passwordHash: string;
};

export type CreatedAdminUserRowDb = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
};

export async function createAdminUserDb(
  input: CreateAdminUserDbInput,
): Promise<CreatedAdminUserRowDb> {
  return prisma.$transaction(async (tx) => {
    const userId = randomUUID();

    const user = await tx.betterAuthUser.create({
      data: {
        id: userId,
        email: input.email,
        emailVerified: true,
        name: input.name,
        role: input.role,
        banned: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    await tx.betterAuthAccount.create({
      data: {
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: input.passwordHash,
      },
    });

    return user;
  });
}
