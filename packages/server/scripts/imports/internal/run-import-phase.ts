import { listImportRunIssues, prisma } from "@beagle/db";

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
  phaseLabel: "phase1" | "phase2" | "phase3",
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
      payloadJson: string | null;
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
            payloadJson: issue.payloadJson,
          });
        }
      }
      cursor = page.nextCursor ?? undefined;
    } while (cursor);

    if (total > 0) {
      console.log(`[import:${phaseLabel}] Issue rows stored: ${total}`);
      console.log(`[import:${phaseLabel}] Issue groups:`);
      for (const [key, count] of [...grouped.entries()].sort(
        (a, b) => b[1] - a[1],
      )) {
        console.log(`[import:${phaseLabel}]   ${key} = ${count}`);
      }
      console.log(`[import:${phaseLabel}] Issue samples:`);
      for (const sample of samples) {
        console.log(
          `[import:${phaseLabel}]   [${sample.stage}/${sample.severity}/${sample.code}] reg=${sample.registrationNo ?? "-"} table=${sample.sourceTable ?? "-"} msg=${sample.message}`,
        );
        if (sample.payloadJson) {
          try {
            const payload = JSON.parse(sample.payloadJson) as {
              totalDistinctTokens?: number;
              mappedDistinctTokens?: number;
              unmappedDistinctTokens?: number;
              unmappedOccurrences?: number;
              unmappedTop?: Array<{ token: string; count: number }>;
              missingDefinitionCodes?: string[];
            };
            if (
              sample.code === "IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS" &&
              typeof payload.unmappedDistinctTokens === "number" &&
              typeof payload.unmappedOccurrences === "number"
            ) {
              console.log(
                `[import:${phaseLabel}]     coverage=unmappedDistinctTokens:${payload.unmappedDistinctTokens}, unmappedOccurrences:${payload.unmappedOccurrences}, totalDistinctTokens:${payload.totalDistinctTokens ?? "-"}, mappedDistinctTokens:${payload.mappedDistinctTokens ?? "-"}`,
              );
            }
            if (
              sample.code === "IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS" &&
              Array.isArray(payload.unmappedTop) &&
              payload.unmappedTop.length > 0
            ) {
              const top = payload.unmappedTop
                .slice(0, 20)
                .map((item) => `${item.token}(${item.count})`)
                .join(", ");
              console.log(`[import:${phaseLabel}]     unmappedTop=${top}`);
            }
            if (
              Array.isArray(payload.missingDefinitionCodes) &&
              payload.missingDefinitionCodes.length > 0
            ) {
              console.log(
                `[import:${phaseLabel}]     missingDefinitionCodes=${payload.missingDefinitionCodes.join(", ")}`,
              );
            }
          } catch {
            const trimmed =
              sample.payloadJson.length > 500
                ? `${sample.payloadJson.slice(0, 500)}...`
                : sample.payloadJson;
            console.log(`[import:${phaseLabel}]     payload=${trimmed}`);
          }
        }
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

export async function disconnectImportScriptPrisma() {
  await prisma.$disconnect();
}
