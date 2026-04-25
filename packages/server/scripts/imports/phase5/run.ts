import { importsService } from "@server/imports/runs";
import {
  disconnectImportScriptPrisma,
  runImportPhase,
} from "../internal/run-import-phase";

async function main() {
  await runImportPhase("phase5", async (createdByUserId, log) => {
    const result = await importsService.runLegacyPhase5(createdByUserId, {
      log,
      auditSource: "SCRIPT",
    });
    return {
      ok: result.body.ok,
      status: result.status,
      body: result.body,
    };
  });
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[import:phase5] Failed: ${message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectImportScriptPrisma();
  });
