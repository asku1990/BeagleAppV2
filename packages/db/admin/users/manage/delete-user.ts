import { prisma } from "@db/core/prisma";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "@db/core/audit-context";
import type { Prisma, PrismaClient } from "@prisma/client";

type AdminUserDbClient = PrismaClient | Prisma.TransactionClient;

function resolveDbClient(dbClient?: AdminUserDbClient): AdminUserDbClient {
  return dbClient ?? prisma;
}

export type AdminUserLookupRowDb = {
  id: string;
  role: string;
  banned: boolean;
};

export async function getAdminUserByIdDb(
  userId: string,
  dbClient?: AdminUserDbClient,
): Promise<AdminUserLookupRowDb | null> {
  return resolveDbClient(dbClient).betterAuthUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });
}

export async function countAdminUsersDb(
  dbClient?: AdminUserDbClient,
): Promise<number> {
  return resolveDbClient(dbClient).betterAuthUser.count({
    where: {
      role: "ADMIN",
    },
  });
}

export async function countActiveAdminUsersDb(
  dbClient?: AdminUserDbClient,
): Promise<number> {
  return resolveDbClient(dbClient).betterAuthUser.count({
    where: {
      role: "ADMIN",
      banned: false,
    },
  });
}

/**
 * Low-level write operation. Must be run inside an audited transaction
 * using `runAdminUserWriteTransactionDb`.
 */
export async function deleteAdminUserDb(
  userId: string,
  tx: Prisma.TransactionClient,
): Promise<boolean> {
  const result = await tx.betterAuthUser.deleteMany({
    where: { id: userId },
  });
  return result.count > 0;
}

export async function runAdminUserWriteTransactionDb<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  auditContext?: AuditContextDb,
): Promise<T> {
  return runInAuditContextDb(auditContext ?? {}, callback);
}

export async function lockAdminUsersForUpdateDb(
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.$queryRaw`
    SELECT id
    FROM "BetterAuthUser"
    WHERE role = 'ADMIN'
    FOR UPDATE
  `;
}
