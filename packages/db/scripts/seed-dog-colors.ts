import { prisma } from "../core/prisma";
import { seedDogColorsDb } from "../dogs/colors";

try {
  const result = await seedDogColorsDb();
  console.log(`[seed] dog colors upserted=${result.codes.length}`);
} catch (error) {
  console.error("[seed] failed to seed dog colors", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
