import { listImportRunIssues, prisma } from "@beagle/db";
import { importsService } from "../imports/service";

type RunResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const createdByUserId =
    args[0] && !args[0].startsWith("--") ? args[0] : undefined;
  const start = Date.now();
  console.log("[import:phase1] Starting import...");
  if (createdByUserId) {
    console.log(`[import:phase1] createdByUserId=${createdByUserId}`);
  }

  const result = await importsService.runLegacyPhase1(createdByUserId, {
    log: (message) => console.log(`[import:phase1] ${message}`),
    auditSource: "SCRIPT",
  });

  const output: RunResult = {
    ok: result.body.ok,
    status: result.status,
    body: result.body,
  };

  console.log(
    `[import:phase1] Completed in ${Math.round((Date.now() - start) / 1000)}s`,
  );
  console.log(JSON.stringify(output, null, 2));

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
    const grouped = new Map<string, number>();
    const samples: Array<{
      stage: string;
      severity: string;
      code: string;
      message: string;
      registrationNo: string | null;
      sourceTable: string | null;
    }> = [];
    let cursor: string | undefined;
    let total = 0;

    do {
      const page = await listImportRunIssues(runId, {
        limit: 500,
        cursor,
      });
      for (const issue of page.items) {
        total += 1;
        const key = `${issue.stage}:${issue.severity}:${issue.code}`;
        grouped.set(key, (grouped.get(key) ?? 0) + 1);
        if (samples.length < 10) {
          samples.push({
            stage: issue.stage,
            severity: issue.severity,
            code: issue.code,
            message: issue.message,
            registrationNo: issue.registrationNo,
            sourceTable: issue.sourceTable,
          });
        }
      }
      cursor = page.nextCursor ?? undefined;
    } while (cursor);

    if (total > 0) {
      console.log(`[import:phase1] Issue rows stored: ${total}`);
      console.log("[import:phase1] Issue groups:");
      for (const [key, count] of [...grouped.entries()].sort(
        (a, b) => b[1] - a[1],
      )) {
        console.log(`[import:phase1]   ${key} = ${count}`);
      }
      console.log("[import:phase1] Issue samples:");
      for (const sample of samples) {
        console.log(
          `[import:phase1]   [${sample.stage}/${sample.severity}/${sample.code}] reg=${sample.registrationNo ?? "-"} table=${sample.sourceTable ?? "-"} msg=${sample.message}`,
        );
      }
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

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
