import {
  type AuditContextDb,
  type ImportIssueSeverity,
  type ImportKind,
  type LegacyTrialMirrorCounts,
  type LegacyTrialMirrorRows,
  TRIAL_MIRROR_TABLES,
  countLegacyTrialMirrorRowsDb,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  fetchLegacyTrialMirrorRows,
  markImportRunFinished,
  markImportRunRunning,
  upsertLegacyTrialMirrorRowsDb,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import { formatLegacyImportSummary } from "@server/imports/runs/phase-summary";
import { toImportRunResponse } from "@server/imports/runs/transform";

type IssueInput = {
  stage: string;
  severity?: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo?: string | null;
  sourceTable?: string | null;
  payloadJson?: string | null;
};

function countMirrorRows(rows: LegacyTrialMirrorRows): LegacyTrialMirrorCounts {
  return {
    akoeall: rows.akoeall.length,
    bealt: rows.bealt.length,
    bealt0: rows.bealt0.length,
    bealt1: rows.bealt1.length,
    bealt2: rows.bealt2.length,
    bealt3: rows.bealt3.length,
  };
}

function sumCounts(counts: LegacyTrialMirrorCounts): number {
  return TRIAL_MIRROR_TABLES.reduce((total, table) => total + counts[table], 0);
}

function countZeroDateRows(rows: LegacyTrialMirrorRows): number {
  return TRIAL_MIRROR_TABLES.reduce((total, table) => {
    const tableRows = rows[table];
    return (
      total +
      tableRows.filter(
        (row) => row.muokattuRaw.trim() === "0000-00-00 00:00:00",
      ).length
    );
  }, 0);
}

function collectKeyIssues(rows: LegacyTrialMirrorRows): IssueInput[] {
  const issues: IssueInput[] = [];

  for (const table of TRIAL_MIRROR_TABLES) {
    for (const row of rows[table]) {
      const hasMissingKey =
        !row.rekno.trim() ||
        !row.tappa.trim() ||
        !row.tappv.trim() ||
        ("era" in row && !Number.isFinite(row.era));
      if (!hasMissingKey) continue;

      issues.push({
        stage: "validate-source",
        severity: "WARNING",
        code: "TRIAL_MIRROR_MISSING_KEY_PART",
        message:
          "Legacy trial mirror source row has a blank or invalid primary-key part.",
        registrationNo: row.rekno || null,
        sourceTable: table,
        payloadJson: row.rawPayloadJson,
      });
    }
  }

  return issues;
}

// Orchestrates the phase2 legacy AJOK mirror import.
// This phase writes only frozen legacy mirror tables; runtime projection is a later phase.
export async function runLegacyPhase2(
  createdByUserId?: string,
  options?: {
    log?: (message: string) => void;
    auditSource?: AuditContextDb["source"];
  },
): Promise<ServiceResult<ImportRunResponse>> {
  const log = options?.log ?? (() => {});
  const auditContext: AuditContextDb = {
    actorUserId: createdByUserId ?? null,
    source: options?.auditSource ?? "SYSTEM",
  };
  const stageStartedAt = new Map<string, number>();
  const startStage = (name: string) => {
    stageStartedAt.set(name, Date.now());
    log(`[stage:${name}] start`);
  };
  const finishStage = (name: string, summary?: string) => {
    const startedAt = stageStartedAt.get(name) ?? Date.now();
    const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
    log(
      `[stage:${name}] done in ${elapsedSeconds}s${summary ? ` ${summary}` : ""}`,
    );
  };
  const logProgress = (table: string, processed: number, total: number) => {
    const percent =
      total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 100;
    log(`[stage:mirror] ${table} progress ${processed}/${total} (${percent}%)`);
  };

  let runId: string | null = null;
  let mirrorRowsUpserted = 0;
  let errorsCount = 0;
  let warningsCount = 0;
  let sourceCounts: LegacyTrialMirrorCounts | null = null;
  let mirrorCounts: LegacyTrialMirrorCounts | null = null;
  const issueBuffer: IssueInput[] = [];
  const ISSUE_BUFFER_SIZE = 250;
  const flushIssueBuffer = async () => {
    if (!runId || issueBuffer.length === 0) return;
    const next = issueBuffer.splice(0, issueBuffer.length);
    await createImportRunIssuesBulk(runId, next, auditContext);
  };
  const recordIssue = async (issue: IssueInput) => {
    const severity = issue.severity ?? "WARNING";
    if (severity === "ERROR") errorsCount += 1;
    if (severity === "WARNING") warningsCount += 1;
    issueBuffer.push({ ...issue, severity });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };

  try {
    const run = await createImportRun({
      kind: "LEGACY_TRIAL_MIRROR" as ImportKind,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("load");
    const rows = await fetchLegacyTrialMirrorRows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    sourceCounts = countMirrorRows(rows);
    const zeroDateRows = countZeroDateRows(rows);
    log(
      `Loaded legacy trial mirror rows: total=${sumCounts(sourceCounts)}, zeroDateMuokattu=${zeroDateRows}`,
    );
    finishStage("load");

    startStage("validate-source");
    for (const issue of collectKeyIssues(rows)) {
      await recordIssue(issue);
    }
    finishStage("validate-source", `warnings=${warningsCount}`);

    startStage("mirror");
    const upsertedCounts = await upsertLegacyTrialMirrorRowsDb(rows, {
      onProgress: logProgress,
    });
    mirrorRowsUpserted = sumCounts(upsertedCounts);
    finishStage("mirror", `upserted=${mirrorRowsUpserted}`);

    startStage("validate-mirror");
    mirrorCounts = await countLegacyTrialMirrorRowsDb();
    for (const table of TRIAL_MIRROR_TABLES) {
      if (sourceCounts[table] !== mirrorCounts[table]) {
        await recordIssue({
          stage: "validate-mirror",
          severity: "ERROR",
          code: "TRIAL_MIRROR_COUNT_MISMATCH",
          message: `Legacy trial mirror count mismatch for ${table}: source=${sourceCounts[table]}, mirror=${mirrorCounts[table]}.`,
          sourceTable: table,
          payloadJson: JSON.stringify({
            table,
            sourceCount: sourceCounts[table],
            mirrorCount: mirrorCounts[table],
          }),
        });
      }
    }
    finishStage("validate-mirror", `errors=${errorsCount}`);

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: errorsCount > 0 ? "FAILED" : "SUCCEEDED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: mirrorRowsUpserted,
        showResultsUpserted: 0,
        errorsCount,
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_TRIAL_MIRROR",
          mirrorRowsUpserted,
          errorsCount,
          warningsCount,
          sourceCounts,
          mirrorCounts,
          zeroDateRows,
        }),
      },
      auditContext,
    );

    if (errorsCount > 0) {
      return {
        status: 500,
        body: {
          ok: false,
          code: "IMPORT_VALIDATION_FAILED",
          error: `Legacy trial mirror validation failed (runId=${finished.id}).`,
        },
      };
    }

    return {
      status: 202,
      body: { ok: true, data: toImportRunResponse(finished) },
    };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "Import failed.";
    log(`Import failed: ${message}`);
    if (!runId) {
      return {
        status: 500,
        body: {
          ok: false,
          code: "IMPORT_FAILED",
          error: `Import run failed before initialization: ${message}`,
        },
      };
    }

    await createImportRunIssue(
      runId,
      {
        stage: "run",
        severity: "ERROR",
        code: "UNEXPECTED_EXCEPTION",
        message,
      },
      auditContext,
    );
    await flushIssueBuffer();
    const finished = await markImportRunFinished(
      runId,
      {
        status: "FAILED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: mirrorRowsUpserted,
        showResultsUpserted: 0,
        errorsCount: errorsCount + 1,
        errorSummary:
          sourceCounts || mirrorCounts
            ? `${message} (sourceRows=${sourceCounts ? sumCounts(sourceCounts) : 0}, mirrorRows=${mirrorCounts ? sumCounts(mirrorCounts) : 0})`
            : message,
      },
      auditContext,
    );

    return {
      status: 500,
      body: {
        ok: false,
        code: "IMPORT_FAILED",
        error: `Import run failed (runId=${finished.id}): ${message}`,
      },
    };
  } finally {
    log("Import run finished");
  }
}
