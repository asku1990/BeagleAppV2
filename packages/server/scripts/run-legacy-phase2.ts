import { prisma } from "@beagle/db";

async function main() {
  console.error(
    "[import:phase2] Not implemented yet. BEJ-42 placeholder for legacy trials split.",
  );
  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
