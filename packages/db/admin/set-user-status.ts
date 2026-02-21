import { prisma } from "../core/prisma";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "../core/audit-context";
import type { Prisma, PrismaClient } from "@prisma/client";

type SetAdminUserStatusDbInput = {
  userId: string;
  status: "active" | "suspended";
};

type AdminUserDbClient = PrismaClient | Prisma.TransactionClient;

function resolveDbClient(dbClient?: AdminUserDbClient): AdminUserDbClient {
  return dbClient ?? prisma;
}

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
