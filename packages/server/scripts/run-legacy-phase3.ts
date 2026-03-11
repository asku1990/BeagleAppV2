import { prisma } from "@beagle/db";

async function main() {
  console.error(
    "[import:phase3] Not implemented yet. BEJ-42 placeholder for legacy shows split.",
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
