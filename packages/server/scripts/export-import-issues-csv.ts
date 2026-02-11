import {
  listImportRunIssues,
  prisma,
  type ImportIssueSeverity,
} from "@beagle/db";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type CsvIssueRow = {
  stage: string;
  severity: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string | null;
  payloadJson: string | null;
};

type StageReasonSummary = {
  stage: string;
  severity: ImportIssueSeverity;
  code: string;
  count: number;
  sampleRegistrationNo: string | null;
  sampleSourceTable: string | null;
  sampleMessage: string;
};

function parseSeverity(
  value: string | undefined,
): ImportIssueSeverity | undefined {
  if (value === "INFO" || value === "WARNING" || value === "ERROR") {
    return value;
  }
  return undefined;
}

function parseArgs(argv: string[]) {
  const raw = argv.slice(2).filter((arg) => arg !== "--");
  const wantsHelp = raw.includes("--help") || raw.includes("-h");
  let runId: string | undefined;
  let stage: string | undefined;
  let code: string | undefined;
  let severity: ImportIssueSeverity | undefined;
  let outDir: string | undefined;
  let limit = 200;
  let error: string | undefined;

  let i = 0;
  if (raw[0] && !raw[0].startsWith("--")) {
    runId = raw[0];
    i = 1;
  }

  for (; i < raw.length; i += 1) {
    const arg = raw[i];
    const value = raw[i + 1];

    if (arg === "--help" || arg === "-h") {
      continue;
    }

    if (
      arg === "--stage" ||
      arg === "--code" ||
      arg === "--severity" ||
      arg === "--out" ||
      arg === "--limit"
    ) {
      if (!value || value.startsWith("--")) {
        error = `Missing value for ${arg}.`;
        break;
      }
    }

    if (arg === "--stage") {
      stage = value;
      i += 1;
      continue;
    }
    if (arg === "--code") {
      code = value;
      i += 1;
      continue;
    }
    if (arg === "--severity") {
      const parsed = parseSeverity(value);
      if (!parsed) {
        error = "--severity must be one of INFO, WARNING, ERROR.";
        break;
      }
      severity = parsed;
      i += 1;
      continue;
    }
    if (arg === "--out") {
      outDir = value;
      i += 1;
      continue;
    }
    if (arg === "--limit") {
      const next = Number(value);
      if (!Number.isFinite(next) || next <= 0) {
        error = "--limit must be a positive number.";
        break;
      }
      limit = Math.min(Math.max(Math.trunc(next), 1), 500);
      i += 1;
      continue;
    }

    if (!arg.startsWith("--")) {
      error = `Unexpected positional argument: ${arg}.`;
      break;
    }
    error = `Unknown option: ${arg}.`;
    break;
  }

  return { runId, stage, code, severity, outDir, limit, wantsHelp, error };
}

function sanitizeCodeForFilename(code: string): string {
  const sanitized = code.replace(/[^A-Za-z0-9._-]/g, "_");
  return sanitized.length > 0 ? sanitized : "UNKNOWN_CODE";
}

function toCsvCell(value: string | null | undefined): string {
  const next = value ?? "";
  if (!/[",\n\r]/.test(next)) {
    return next;
  }
  return `"${next.replace(/"/g, '""')}"`;
}

function toCsvLine(values: Array<string | null | undefined>): string {
  return values.map(toCsvCell).join(",");
}

async function main() {
  const { runId, stage, code, severity, outDir, limit, wantsHelp, error } =
    parseArgs(process.argv);
  if (wantsHelp || error || !runId || runId.startsWith("--")) {
    if (error) {
      console.error(error);
    }
    console.error(
      "Usage: pnpm --filter @beagle/server import:issues:csv -- <RUN_ID> [--stage <stage>] [--code <code>] [--severity <INFO|WARNING|ERROR>] [--limit <n>] [--out <dir>]",
    );
    process.exitCode = wantsHelp && !error ? 0 : 1;
    return;
  }

  const outputDir = outDir
    ? path.resolve(outDir)
    : path.join("/tmp", "import-issues", runId);

  let cursor: string | undefined;
  let total = 0;
  const byCode = new Map<string, CsvIssueRow[]>();
  const stageReasonSummary = new Map<string, StageReasonSummary>();

  do {
    const page = await listImportRunIssues(runId, {
      stage,
      code,
      severity,
      limit,
      cursor,
    });

    for (const item of page.items) {
      total += 1;
      const rows = byCode.get(item.code) ?? [];
      rows.push({
        stage: item.stage,
        severity: item.severity,
        code: item.code,
        message: item.message,
        registrationNo: item.registrationNo,
        sourceTable: item.sourceTable,
        payloadJson: item.payloadJson,
      });
      byCode.set(item.code, rows);

      const stageKey = `${item.stage}|${item.severity}|${item.code}`;
      const existing = stageReasonSummary.get(stageKey);
      if (existing) {
        existing.count += 1;
      } else {
        stageReasonSummary.set(stageKey, {
          stage: item.stage,
          severity: item.severity,
          code: item.code,
          count: 1,
          sampleRegistrationNo: item.registrationNo,
          sampleSourceTable: item.sourceTable,
          sampleMessage: item.message,
        });
      }
    }

    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  await mkdir(outputDir, { recursive: true });

  const codeEntries = [...byCode.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const indexLines: string[] = [toCsvLine(["code", "count", "file"])];

  for (const [issueCode, rows] of codeEntries) {
    const filename = `${sanitizeCodeForFilename(issueCode)}.csv`;
    const filePath = path.join(outputDir, filename);
    const lines = [
      toCsvLine([
        "registrationNo",
        "sourceTable",
        "stage",
        "severity",
        "message",
        "payloadJson",
      ]),
      ...rows.map((row) =>
        toCsvLine([
          row.registrationNo,
          row.sourceTable,
          row.stage,
          row.severity,
          row.message,
          row.payloadJson,
        ]),
      ),
    ];
    await writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
    indexLines.push(toCsvLine([issueCode, String(rows.length), filename]));
  }

  const indexPath = path.join(outputDir, "index.csv");
  await writeFile(indexPath, `${indexLines.join("\n")}\n`, "utf8");

  const stageReasonRows = [...stageReasonSummary.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    if (a.stage !== b.stage) return a.stage.localeCompare(b.stage);
    if (a.severity !== b.severity) return a.severity.localeCompare(b.severity);
    return a.code.localeCompare(b.code);
  });
  const stageReasonsPath = path.join(outputDir, "stage-reasons.csv");
  const stageReasonLines = [
    toCsvLine([
      "stage",
      "severity",
      "code",
      "count",
      "sampleRegistrationNo",
      "sampleSourceTable",
      "sampleMessage",
    ]),
    ...stageReasonRows.map((row) =>
      toCsvLine([
        row.stage,
        row.severity,
        row.code,
        String(row.count),
        row.sampleRegistrationNo,
        row.sampleSourceTable,
        row.sampleMessage,
      ]),
    ),
  ];
  await writeFile(stageReasonsPath, `${stageReasonLines.join("\n")}\n`, "utf8");

  console.log(`[import:issues:csv] runId=${runId}`);
  console.log(`[import:issues:csv] total=${total}`);
  console.log(`[import:issues:csv] output=${outputDir}`);

  if (codeEntries.length === 0) {
    console.log(
      "[import:issues:csv] no issues found; wrote index.csv and stage-reasons.csv only",
    );
    return;
  }

  for (const [issueCode, rows] of codeEntries) {
    const filename = `${sanitizeCodeForFilename(issueCode)}.csv`;
    console.log(
      `[import:issues:csv] code=${issueCode} count=${rows.length} file=${path.join(outputDir, filename)}`,
    );
  }
  console.log(`[import:issues:csv] index=${indexPath}`);
  console.log(`[import:issues:csv] stageReasons=${stageReasonsPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
