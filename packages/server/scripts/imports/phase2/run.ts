import { importsService } from "../../../imports";
import { disconnectImportScriptPrisma, runImportPhase } from "../internal";

async function main() {
  await runImportPhase("phase2", async (createdByUserId, log) => {
    const result = await importsService.runLegacyPhase2(createdByUserId, {
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
    console.error(error);
    process.exitCode = 1;
  })
  .finally(disconnectImportScriptPrisma);
