import {
  type AuditContextDb,
  type ImportIssueSeverity,
  ImportKind,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  countTrialEntryRowsDb,
  countTrialResultRowsDb,
  fetchLegacyTrialRows,
  listPhase2DogRegistrationsDb,
  markImportRunFinished,
  markImportRunRunning,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../core/result";
import { upsertCanonicalTrialRows } from "../internal";
import { formatLegacyImportSummary } from "../runs/phase-summary";
import { toImportRunResponse } from "../runs/transform";

// Runs the legacy phase2 trials-only import into canonical TrialEvent/TrialEntry schema.
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
  const logProgress = (name: string, processed: number, total: number) => {
    const percent =
      total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 100;
    log(`[stage:${name}] progress ${processed}/${total} (${percent}%)`);
  };
  let runId: string | null = null;
  let trialResultsUpserted = 0;
  let errorsCount = 0;
  let trialResultBaselineCount = 0;
  let canonicalEntryTotalCount = 0;
  const issueBuffer: Array<{
    stage: string;
    severity?: ImportIssueSeverity;
    code: string;
    message: string;
    registrationNo?: string | null;
    sourceTable?: string | null;
    payloadJson?: string | null;
  }> = [];
  const ISSUE_BUFFER_SIZE = 250;
  const flushIssueBuffer = async () => {
    if (!runId || issueBuffer.length === 0) return;
    const next = issueBuffer.splice(0, issueBuffer.length);
    await createImportRunIssuesBulk(runId, next, auditContext);
  };
  const recordIssue = async (issue: {
    stage: string;
    severity?: ImportIssueSeverity;
    code: string;
    message: string;
    registrationNo?: string | null;
    sourceTable?: string | null;
    payloadJson?: string | null;
  }) => {
    issueBuffer.push({ ...issue, severity: issue.severity ?? "WARNING" });
    if (issueBuffer.length >= ISSUE_BUFFER_SIZE) {
      await flushIssueBuffer();
    }
  };

  try {
    const run = await createImportRun({
      kind: ImportKind.LEGACY_PHASE2,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("load");
    const trialRows = await fetchLegacyTrialRows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    log(`Loaded legacy trial source rows: total=${trialRows.length}`);
    finishStage("load");

    startStage("index");
    const registrations = await listPhase2DogRegistrationsDb();
    const dogIdByRegistration = new Map(
      registrations.map((registration) => [
        registration.registrationNo,
        registration.dogId,
      ]),
    );
    log(`Indexed dogs by registration: ${dogIdByRegistration.size}`);
    finishStage("index");

    startStage("baseline-counts");
    trialResultBaselineCount = await countTrialResultRowsDb();
    log(`Baseline TrialResult count=${trialResultBaselineCount}`);
    finishStage("baseline-counts");

    startStage("trials");
    const trialResult = await upsertCanonicalTrialRows(
      trialRows,
      dogIdByRegistration,
      {
        onProgress: (processed, total) =>
          logProgress("trials", processed, total),
      },
    );
    trialResultsUpserted = trialResult.upserted;
    errorsCount += trialResult.errors;
    for (const issue of trialResult.issues) {
      await recordIssue({
        stage: "trials",
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
        registrationNo: issue.registrationNo,
        sourceTable: issue.sourceTable,
        payloadJson: issue.payloadJson,
      });
    }
    log(
      `Canonical trial entries upserted=${trialResultsUpserted}, trial errors=${trialResult.errors}`,
    );
    finishStage("trials");

    startStage("compare-counts");
    canonicalEntryTotalCount = await countTrialEntryRowsDb();
    log(
      `Count comparison oldTrialResult=${trialResultBaselineCount}, canonicalTrialEntry=${canonicalEntryTotalCount}`,
    );
    finishStage("compare-counts");

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: "SUCCEEDED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted,
        showResultsUpserted: 0,
        errorsCount,
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_PHASE2",
          trialResultsUpserted,
          errorsCount,
          oldTrialResultCount: trialResultBaselineCount,
          canonicalTrialEntryCount: canonicalEntryTotalCount,
        }),
      },
      auditContext,
    );

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
        trialResultsUpserted,
        showResultsUpserted: 0,
        errorsCount: errorsCount + 1,
        errorSummary:
          canonicalEntryTotalCount > 0 || trialResultBaselineCount > 0
            ? `${message} (oldTrialResult=${trialResultBaselineCount}, canonicalTrialEntry=${canonicalEntryTotalCount})`
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
