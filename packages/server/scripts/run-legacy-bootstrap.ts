import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function runPhase(scriptFile: string, label: string, args: string[]) {
  const scriptPath = resolve(__dirname, scriptFile);
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx/esm", scriptPath, ...args],
    {
      stdio: "inherit",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${label} failed with exit code ${result.status ?? "unknown"}.`,
    );
  }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  console.log("[import:bootstrap] Starting phase1 -> phase2 -> phase3");

  runPhase("run-legacy-phase1.ts", "import:phase1", args);
  runPhase("run-legacy-phase2.ts", "import:phase2", args);
  runPhase("run-legacy-phase3.ts", "import:phase3", args);

  console.log("[import:bootstrap] Completed all phases");
}

main().catch((error) => {
  console.error("[import:bootstrap] Failed:", error);
  process.exitCode = 1;
});
