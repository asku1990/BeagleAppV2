import { prisma } from "@beagle/db";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runLegacyTrialMirrorValidation } from "../../../imports/trial-mirror-validation";
import type {
  TrialMirrorValidationIssue,
  TrialMirrorValidationSeverity,
} from "../../../imports/trial-mirror-validation";

type ParsedArgs = {
  code: string | undefined;
  severity: TrialMirrorValidationSeverity | undefined;
  outDir: string | undefined;
  wantsHelp: boolean;
  error: string | undefined;
};

type IssueKeyParts = {
  rekno: string | null;
  tappa: string | null;
  tappv: string | null;
  era: string | null;
};

function parseSeverity(
  value: string | undefined,
): TrialMirrorValidationSeverity | undefined {
  if (value === "INFO" || value === "WARNING" || value === "ERROR") {
    return value;
  }
  return undefined;
}

function parseArgs(argv: string[]): ParsedArgs {
  const raw = argv.slice(2).filter((arg) => arg !== "--");
  const wantsHelp = raw.includes("--help") || raw.includes("-h");
  let code: string | undefined;
  let severity: TrialMirrorValidationSeverity | undefined;
  let outDir: string | undefined;
  let error: string | undefined;

  for (let i = 0; i < raw.length; i += 1) {
    const arg = raw[i];
    const value = raw[i + 1];

    if (arg === "--help" || arg === "-h") {
      continue;
    }

    if (arg === "--code" || arg === "--severity" || arg === "--out") {
      if (!value || value.startsWith("--")) {
        error = `Missing value for ${arg}.`;
        break;
      }
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

    error = arg.startsWith("--")
      ? `Unknown option: ${arg}.`
      : `Unexpected positional argument: ${arg}.`;
    break;
  }

  return { code, severity, outDir, wantsHelp, error };
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

function parseIssueKey(key: string | null): IssueKeyParts {
  if (!key) {
    return { rekno: null, tappa: null, tappv: null, era: null };
  }
  const [rekno = null, tappa = null, tappv = null, era = null] = key.split("|");
  return { rekno, tappa, tappv, era };
}

function issueToCsvLine(issue: TrialMirrorValidationIssue): string {
  const keyParts = parseIssueKey(issue.key);
  return toCsvLine([
    issue.severity,
    issue.code,
    issue.sourceTable,
    keyParts.rekno,
    keyParts.tappa,
    keyParts.tappv,
    keyParts.era,
    issue.key,
    issue.field,
    issue.value == null ? null : String(issue.value),
    issue.message,
  ]);
}

async function writeIssueCsv(
  filePath: string,
  issues: TrialMirrorValidationIssue[],
) {
  const lines = [
    toCsvLine([
      "severity",
      "code",
      "sourceTable",
      "rekno",
      "tappa",
      "tappv",
      "era",
      "key",
      "field",
      "value",
      "message",
    ]),
    ...issues.map(issueToCsvLine),
  ];
  await writeFile(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const { code, severity, outDir, wantsHelp, error } = parseArgs(process.argv);
  if (wantsHelp || error) {
    if (error) {
      console.error(error);
    }
    console.error(
      "Usage: pnpm --filter @beagle/server import:trials:validate-mirror:csv -- [--code <code>] [--severity <INFO|WARNING|ERROR>] [--out <dir>]",
    );
    process.exitCode = wantsHelp && !error ? 0 : 1;
    return;
  }

  const defaultRoot = process.env.INIT_CWD ?? process.cwd();
  const outputDir = outDir
    ? path.resolve(outDir)
    : path.join(defaultRoot, "tmp", "trial-mirror-validation");

  const report = await runLegacyTrialMirrorValidation();
  const issues = report.issues.filter((issue) => {
    if (code && issue.code !== code) return false;
    if (severity && issue.severity !== severity) return false;
    return true;
  });

  await mkdir(outputDir, { recursive: true });

  const byCode = new Map<string, TrialMirrorValidationIssue[]>();
  for (const issue of issues) {
    const rows = byCode.get(issue.code) ?? [];
    rows.push(issue);
    byCode.set(issue.code, rows);
  }

  await writeIssueCsv(path.join(outputDir, "all-issues.csv"), issues);

  const codeEntries = [...byCode.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const indexLines = [toCsvLine(["code", "count", "file"])];

  for (const [issueCode, rows] of codeEntries) {
    const filename = `${sanitizeCodeForFilename(issueCode)}.csv`;
    await writeIssueCsv(path.join(outputDir, filename), rows);
    indexLines.push(toCsvLine([issueCode, String(rows.length), filename]));
  }

  await writeFile(
    path.join(outputDir, "index.csv"),
    `${indexLines.join("\n")}\n`,
    "utf8",
  );

  console.log(`[import:trials:validate-mirror:csv] total=${issues.length}`);
  console.log(`[import:trials:validate-mirror:csv] output=${outputDir}`);
  for (const [issueCode, rows] of codeEntries) {
    const filename = `${sanitizeCodeForFilename(issueCode)}.csv`;
    console.log(
      `[import:trials:validate-mirror:csv] code=${issueCode} count=${rows.length} file=${path.join(outputDir, filename)}`,
    );
  }
  console.log(
    `[import:trials:validate-mirror:csv] all=${path.join(outputDir, "all-issues.csv")}`,
  );
  console.log(
    `[import:trials:validate-mirror:csv] index=${path.join(outputDir, "index.csv")}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
