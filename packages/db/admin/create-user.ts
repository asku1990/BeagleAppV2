import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "../core/audit-context";
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
  auditContext?: AuditContextDb,
): Promise<CreatedAdminUserRowDb> {
  const runCreate = async (tx: Prisma.TransactionClient) => {
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
  };

  if (auditContext) {
    return runInAuditContextDb(auditContext, runCreate);
  }

  return prisma.$transaction(runCreate);
}
