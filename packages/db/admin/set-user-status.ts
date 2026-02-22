import { prisma } from "../core/prisma";
import type { Prisma, PrismaClient } from "@prisma/client";

type SetAdminUserStatusDbInput = {
  userId: string;
  status: "active" | "suspended";
};

type AdminUserDbClient = PrismaClient | Prisma.TransactionClient;

function resolveDbClient(dbClient?: AdminUserDbClient): AdminUserDbClient {
  return dbClient ?? prisma;
}

/**
 * Low-level write operation. Audit context (actor, session, source) is the
 * caller's responsibility — use `runAdminUserWriteTransactionDb` to run this
 * inside an audited transaction. If called standalone without a `dbClient`,
 * the audit trigger will fire with empty attribution (SYSTEM fallback).
 */
export async function setAdminUserStatusDb(
  input: SetAdminUserStatusDbInput,
  dbClient?: AdminUserDbClient,
): Promise<void> {
  const banned = input.status === "suspended";

  const applyUpdate = async (db: AdminUserDbClient) => {
    await db.betterAuthUser.update({
      where: { id: input.userId },
      data: {
        banned,
        banReason: banned ? "Suspended by admin" : null,
        banExpires: null,
      },
    });

    if (banned) {
      await db.betterAuthSession.deleteMany({
        where: { userId: input.userId },
      });
    }
  };

  if (dbClient) {
    await applyUpdate(resolveDbClient(dbClient));
    return;
  }

  await prisma.$transaction(async (tx) => {
    await applyUpdate(tx);
  });
}
