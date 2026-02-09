import { listImportRunIssues, prisma } from "@beagle/db";

type IssueRow = {
  id: string;
  stage: string;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string | null;
};

const USAGE =
  "Usage: pnpm import:issues <RUN_ID> [--stage <stage>] [--code <code>] [--limit <n>]";

function parseArgs(argv: string[]) {
  const raw = argv.slice(2).filter((arg) => arg !== "--");
  const wantsHelp = raw.includes("--help") || raw.includes("-h");
  let runId: string | undefined;
  let stage: string | undefined;
  let code: string | undefined;
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

    if (arg === "--stage" || arg === "--code" || arg === "--limit") {
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
    if (arg === "--limit") {
      const next = Number(value);
      if (!Number.isFinite(next) || next <= 0) {
        error = "--limit must be a positive number.";
        break;
      }
      limit = Math.min(Math.trunc(next), 1000);
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

  return { runId, stage, code, limit, wantsHelp, error };
}

async function main() {
  const { runId, stage, code, limit, wantsHelp, error } = parseArgs(
    process.argv,
  );
  if (wantsHelp) {
    console.log(USAGE);
    return;
  }
  if (error) {
    console.error(error);
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }
  if (!runId) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  let cursor: string | undefined;
  let total = 0;
  const grouped = new Map<string, number>();
  const sampleRows: IssueRow[] = [];

  do {
    const page = await listImportRunIssues(runId, {
      stage,
      code,
      limit,
      cursor,
    });
    for (const item of page.items) {
      total += 1;
      const key = `${item.stage}:${item.code}`;
      grouped.set(key, (grouped.get(key) ?? 0) + 1);
      if (sampleRows.length < 20) {
        sampleRows.push({
          id: item.id,
          stage: item.stage,
          code: item.code,
          message: item.message,
          registrationNo: item.registrationNo,
          sourceTable: item.sourceTable,
        });
      }
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  console.log(`[import:issues] runId=${runId}`);
  console.log(`[import:issues] total=${total}`);

  if (total === 0) return;

  console.log("[import:issues] grouped:");
  for (const [key, count] of [...grouped.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    console.log(`[import:issues]   ${key} = ${count}`);
  }

  console.log("[import:issues] samples:");
  for (const row of sampleRows) {
    console.log(
      `[import:issues]   [${row.stage}/${row.code}] reg=${row.registrationNo ?? "-"} table=${row.sourceTable ?? "-"} id=${row.id} msg=${row.message}`,
    );
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
