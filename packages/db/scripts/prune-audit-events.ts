import { prisma } from "../core/prisma";

async function main() {
  let totalDeleted = 0;
  let deleted: number;
  do {
    deleted = await prisma.$executeRaw`
      DELETE FROM "AuditEvent"
      WHERE id IN (
        SELECT id FROM "AuditEvent"
        WHERE "happenedAt" < NOW() - INTERVAL '12 months'
        LIMIT 1000
      )
    `;
    totalDeleted += deleted;
  } while (deleted > 0);

  console.log(`[audit:prune] Deleted ${totalDeleted} audit event(s).`);
}

main()
  .catch((error) => {
    console.error("[audit:prune] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
