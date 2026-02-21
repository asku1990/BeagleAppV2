import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type AuditSourceDb = "WEB" | "SCRIPT" | "SYSTEM";

export type AuditContextDb = {
  actorUserId?: string | null;
  actorSessionId?: string | null;
  source?: AuditSourceDb;
};

function normalizeSource(source: AuditContextDb["source"]): AuditSourceDb {
  if (source === "WEB" || source === "SCRIPT" || source === "SYSTEM") {
    return source;
  }
  return "SYSTEM";
}

export async function setAuditContextDb(
  tx: Prisma.TransactionClient,
  context: AuditContextDb,
): Promise<void> {
  await tx.$executeRaw`SELECT set_config('app.audit.actor_user_id', ${context.actorUserId ?? ""}, true)`;
  await tx.$executeRaw`SELECT set_config('app.audit.actor_session_id', ${context.actorSessionId ?? ""}, true)`;
  await tx.$executeRaw`SELECT set_config('app.audit.source', ${normalizeSource(context.source)}, true)`;
}

export async function runInAuditContextDb<T>(
  context: AuditContextDb,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await setAuditContextDb(tx, context);
    return callback(tx);
  });
}
