import { listImportRunIssues, prisma } from "@beagle/db";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type CsvIssueRow = {
  stage: string;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string | null;
  payloadJson: string | null;
};

function parseArgs(argv: string[]) {
  const raw = argv.slice(2).filter((arg) => arg !== "--");
  const wantsHelp = raw.includes("--help") || raw.includes("-h");
  const runId = raw[0];
  let stage: string | undefined;
  let code: string | undefined;
  let outDir: string | undefined;
  let limit = 200;

  for (let i = 1; i < raw.length; i += 1) {
    const arg = raw[i];
    if (arg === "--stage") stage = raw[i + 1];
    if (arg === "--code") code = raw[i + 1];
    if (arg === "--out") outDir = raw[i + 1];
    if (arg === "--limit") {
      const next = Number(raw[i + 1]);
      if (Number.isFinite(next) && next > 0) {
        limit = Math.min(Math.max(Math.trunc(next), 1), 500);
      }
    }
  }

  return { runId, stage, code, outDir, limit, wantsHelp };
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
  const { runId, stage, code, outDir, limit, wantsHelp } = parseArgs(
    process.argv,
  );
  if (wantsHelp || !runId || runId.startsWith("--")) {
    console.error(
      "Usage: pnpm --filter @beagle/server import:issues:csv -- <RUN_ID> [--stage <stage>] [--code <code>] [--limit <n>] [--out <dir>]",
    );
    process.exitCode = wantsHelp ? 0 : 1;
    return;
  }

  const outputDir = outDir
    ? path.resolve(outDir)
    : path.join("/tmp", "import-issues", runId);

  let cursor: string | undefined;
  let total = 0;
  const byCode = new Map<string, CsvIssueRow[]>();

  do {
    const page = await listImportRunIssues(runId, {
      stage,
      code,
      limit,
      cursor,
    });

    for (const item of page.items) {
      total += 1;
      const rows = byCode.get(item.code) ?? [];
      rows.push({
        stage: item.stage,
        code: item.code,
        message: item.message,
        registrationNo: item.registrationNo,
        sourceTable: item.sourceTable,
        payloadJson: item.payloadJson,
      });
      byCode.set(item.code, rows);
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
        "message",
        "payloadJson",
      ]),
      ...rows.map((row) =>
        toCsvLine([
          row.registrationNo,
          row.sourceTable,
          row.stage,
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

  console.log(`[import:issues:csv] runId=${runId}`);
  console.log(`[import:issues:csv] total=${total}`);
  console.log(`[import:issues:csv] output=${outputDir}`);

  if (codeEntries.length === 0) {
    console.log("[import:issues:csv] no issues found; wrote index.csv only");
    return;
  }

  for (const [issueCode, rows] of codeEntries) {
    const filename = `${sanitizeCodeForFilename(issueCode)}.csv`;
    console.log(
      `[import:issues:csv] code=${issueCode} count=${rows.length} file=${path.join(outputDir, filename)}`,
    );
  }
  console.log(`[import:issues:csv] index=${indexPath}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
