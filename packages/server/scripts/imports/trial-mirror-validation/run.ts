import { prisma } from "@beagle/db";
import {
  formatTrialMirrorValidationReport,
  runLegacyTrialMirrorValidation,
} from "../../../imports/trial-mirror-validation";

async function main() {
  const startedAt = Date.now();
  console.log("[import:trials:validate-mirror] Starting validation...");
  const report = await runLegacyTrialMirrorValidation();

  for (const line of formatTrialMirrorValidationReport(report)) {
    console.log(`[import:trials:validate-mirror] ${line}`);
  }

  console.log(
    `[import:trials:validate-mirror] Completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );

  if (report.issueCounts.ERROR > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
