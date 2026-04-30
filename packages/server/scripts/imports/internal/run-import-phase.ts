import { getImportRunById, listImportRunIssues, prisma } from "@beagle/db";
import {
  createImportIssueSummaryCollector,
  formatImportIssueSummary,
} from "./issue-summary";

type RunResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

type ExecutePhase = (
  createdByUserId: string | undefined,
  log: (message: string) => void,
) => Promise<RunResult>;

export async function runImportPhase(
  phaseLabel: "phase1" | "phase1.5" | "phase2" | "phase3" | "phase5",
  executePhase: ExecutePhase,
) {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const createdByUserId =
    args[0] && !args[0].startsWith("--") ? args[0] : undefined;
  const start = Date.now();
  console.log(`[import:${phaseLabel}] Starting import...`);
  if (createdByUserId) {
    console.log(`[import:${phaseLabel}] createdByUserId=${createdByUserId}`);
  }

  const output = await executePhase(createdByUserId, (message) =>
    console.log(`[import:${phaseLabel}] ${message}`),
  );

  console.log(
    `[import:${phaseLabel}] Completed in ${Math.round((Date.now() - start) / 1000)}s`,
  );

  const runIdFromError =
    !output.ok &&
    typeof output.body === "object" &&
    output.body != null &&
    "error" in output.body &&
    typeof output.body.error === "string"
      ? (output.body.error.match(/runId=([A-Za-z0-9_-]+)/)?.[1] ?? null)
      : null;

  const runId =
    output.ok &&
    typeof output.body === "object" &&
    output.body != null &&
    "data" in output.body &&
    typeof output.body.data === "object" &&
    output.body.data != null &&
    "id" in output.body.data &&
    typeof output.body.data.id === "string"
      ? output.body.data.id
      : runIdFromError;

  if (runId) {
    try {
      const run = await getImportRunById(runId);
      if (run) {
        console.log(
          `[import:${phaseLabel}] Summary: ${run.errorSummary ?? "No final summary available."}`,
        );
        console.log(
          `[import:${phaseLabel}] Run stats: status=${run.status} errors=${run.errorsCount} issues=${run.issuesCount}`,
        );
      }

      const collector = createImportIssueSummaryCollector();
      let cursor: string | undefined;

      do {
        const page = await listImportRunIssues(runId, {
          limit: 500,
          cursor,
        });
        for (const issue of page.items) {
          collector.add({
            stage: issue.stage,
            severity: issue.severity,
            code: issue.code,
            message: issue.message,
            registrationNo: issue.registrationNo,
            sourceTable: issue.sourceTable,
            payloadJson: issue.payloadJson,
          });
        }
        cursor = page.nextCursor ?? undefined;
      } while (cursor);

      const summary = collector.build();
      if (summary.total > 0) {
        for (const line of formatImportIssueSummary(summary)) {
          console.log(`[import:${phaseLabel}] ${line}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(
        `[import:${phaseLabel}] Skipped post-run summary due to error: ${message}`,
      );
    }
  }

  if (
    !output.ok ||
    (output.ok &&
      typeof output.body === "object" &&
      output.body != null &&
      "data" in output.body &&
      typeof output.body.data === "object" &&
      output.body.data != null &&
      "status" in output.body.data &&
      output.body.data.status === "FAILED")
  ) {
    process.exitCode = 1;
  }
}

export async function disconnectImportScriptPrisma() {
  await prisma.$disconnect();
}
