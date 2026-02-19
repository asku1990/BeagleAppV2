import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const GLOBAL_MIN = 75;

const coverageTargets = [
  {
    name: "@beagle/api-client",
    file: "packages/api-client/coverage/coverage-final.json",
  },
  { name: "@beagle/auth", file: "packages/auth/coverage/coverage-final.json" },
  {
    name: "@beagle/contracts",
    file: "packages/contracts/coverage/coverage-final.json",
  },
  { name: "@beagle/db", file: "packages/db/coverage/coverage-final.json" },
  {
    name: "@beagle/server",
    file: "packages/server/coverage/coverage-final.json",
  },
  { name: "@beagle/web", file: "apps/web/coverage/coverage-final.json" },
];

function toPct(covered, total) {
  if (total === 0) {
    return 100;
  }
  return (covered / total) * 100;
}

function summarizeCoverageMap(coverageMap) {
  let statementsTotal = 0;
  let statementsCovered = 0;
  let branchesTotal = 0;
  let branchesCovered = 0;
  let functionsTotal = 0;
  let functionsCovered = 0;
  let linesTotal = 0;
  let linesCovered = 0;

  for (const fileData of Object.values(coverageMap)) {
    const s = Object.values(fileData.s ?? {});
    statementsTotal += s.length;
    statementsCovered += s.filter((count) => Number(count) > 0).length;

    const f = Object.values(fileData.f ?? {});
    functionsTotal += f.length;
    functionsCovered += f.filter((count) => Number(count) > 0).length;

    const b = Object.values(fileData.b ?? {}).flatMap((value) =>
      Array.isArray(value) ? value : [],
    );
    branchesTotal += b.length;
    branchesCovered += b.filter((count) => Number(count) > 0).length;

    const l = Object.values(fileData.l ?? {});
    if (l.length > 0) {
      linesTotal += l.length;
      linesCovered += l.filter((count) => Number(count) > 0).length;
    } else {
      const lineHits = new Map();
      for (const [stmtId, location] of Object.entries(
        fileData.statementMap ?? {},
      )) {
        const line = location?.start?.line;
        if (typeof line !== "number") {
          continue;
        }
        const hits = Number(fileData.s?.[stmtId] ?? 0);
        const previous = Number(lineHits.get(line) ?? 0);
        lineHits.set(line, Math.max(previous, hits));
      }
      linesTotal += lineHits.size;
      linesCovered += [...lineHits.values()].filter(
        (count) => count > 0,
      ).length;
    }
  }

  return {
    statements: toPct(statementsCovered, statementsTotal),
    branches: toPct(branchesCovered, branchesTotal),
    functions: toPct(functionsCovered, functionsTotal),
    lines: toPct(linesCovered, linesTotal),
  };
}

function loadSummary(absFilePath) {
  const raw = fs.readFileSync(absFilePath, "utf8");
  const json = JSON.parse(raw);
  return summarizeCoverageMap(json);
}

let hasFailure = false;

for (const target of coverageTargets) {
  const absFile = path.resolve(root, target.file);
  if (!fs.existsSync(absFile)) {
    console.error(
      `[coverage-check] Missing coverage file for ${target.name}: ${target.file}`,
    );
    hasFailure = true;
    continue;
  }

  const summary = loadSummary(absFile);
  const metrics = summary;

  const failedMetrics = Object.entries(metrics).filter(
    ([, value]) => typeof value === "number" && value < GLOBAL_MIN,
  );

  console.log(
    `[coverage-check] ${target.name}: ` +
      `${metrics.statements.toFixed(2)} / ${metrics.branches.toFixed(2)} / ` +
      `${metrics.functions.toFixed(2)} / ${metrics.lines.toFixed(2)}`,
  );

  if (failedMetrics.length > 0) {
    const details = failedMetrics
      .map(([key, value]) => `${key}=${value.toFixed(2)} (< ${GLOBAL_MIN})`)
      .join(", ");
    console.error(
      `[coverage-check] ${target.name} failed global threshold: ${details}`,
    );
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exitCode = 1;
} else {
  console.log(
    `[coverage-check] All package global coverage metrics are >= ${GLOBAL_MIN}.`,
  );
}
