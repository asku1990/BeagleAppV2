import { seedShowResultDefinitions } from "../shows";

async function main(): Promise<void> {
  const result = await seedShowResultDefinitions();
  console.log(`[seed] show result definitions upserted=${result.upserted}`);
}

main().catch((error) => {
  console.error("[seed] failed to seed show result definitions", error);
  process.exitCode = 1;
});
