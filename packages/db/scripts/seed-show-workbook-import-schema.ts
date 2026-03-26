import { seedShowWorkbookImportSchema } from "../shows";
import { prisma } from "../core/prisma";

async function main(): Promise<void> {
  const result = await seedShowWorkbookImportSchema();
  console.log(`[seed] show workbook import schema upserted=${result.upserted}`);
}

main()
  .catch((error) => {
    console.error("[seed] failed to seed show workbook import schema", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
