import { prisma } from "../core/prisma";

async function main() {
  const deletedCount = await prisma.$executeRaw`
    DELETE FROM "AuditEvent"
    WHERE "happenedAt" < NOW() - INTERVAL '12 months'
  `;

  console.log(`[audit:prune] Deleted ${deletedCount} audit event(s).`);
}

main()
  .catch((error) => {
    console.error("[audit:prune] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
