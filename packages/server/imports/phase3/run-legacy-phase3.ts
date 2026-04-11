import {
  type AuditContextDb,
  type ImportIssueSeverity,
  ImportKind,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  fetchLegacyShowRows,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../core/result";
import { upsertShowRows } from "../internal";
import { formatLegacyImportSummary } from "../runs/phase-summary";
import { toImportRunResponse } from "../runs/transform";

// Runs one-shot legacy phase3 initial load into canonical show tables.
// Reruns are intentionally blocked when canonical show rows already exist.
export async function runLegacyPhase3(
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
  let showResultsUpserted = 0;
  let errorsCount = 0;
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
      kind: ImportKind.LEGACY_PHASE3,
      createdByUserId,
      auditContext,
    });
    runId = run.id;
    log(`Created import run ${run.id}`);
    await markImportRunRunning(run.id, auditContext);
    log("Marked run as RUNNING");

    startStage("preflight-initial-only");
    const [showEventCount, showEntryCount, showResultItemCount] =
      await Promise.all([
        prisma.showEvent.count(),
        prisma.showEntry.count(),
        prisma.showResultItem.count(),
      ]);
    const hasCanonicalShowData =
      showEventCount > 0 || showEntryCount > 0 || showResultItemCount > 0;
    if (hasCanonicalShowData) {
      const message =
        "Legacy phase3 initial load is one-shot only: canonical show tables already contain data.";
      await createImportRunIssue(
        run.id,
        {
          stage: "preflight-initial-only",
          severity: "ERROR",
          code: "LEGACY_PHASE3_ONE_SHOT_ONLY",
          message,
          payloadJson: JSON.stringify({
            showEventCount,
            showEntryCount,
            showResultItemCount,
          }),
        },
        auditContext,
      );
      const finished = await markImportRunFinished(
        run.id,
        {
          status: "FAILED",
          dogsUpserted: 0,
          ownersUpserted: 0,
          ownershipsUpserted: 0,
          trialResultsUpserted: 0,
          showResultsUpserted: 0,
          errorsCount: 1,
          errorSummary: message,
        },
        auditContext,
      );
      return {
        status: 409,
        body: {
          ok: false,
          code: "LEGACY_PHASE3_ONE_SHOT_ONLY",
          error: `Import run failed (runId=${finished.id}): ${message}`,
        },
      };
    }
    finishStage("preflight-initial-only");

    startStage("load");
    const showRows = await fetchLegacyShowRows({
      log: (message) => log(`[stage:load] ${message}`),
    });
    log(`Loaded legacy show rows: showResults=${showRows.length}`);
    finishStage("load");

    startStage("index");
    const registrations = await prisma.dogRegistration.findMany({
      select: { registrationNo: true, dogId: true },
    });
    const dogIdByRegistration = new Map(
      registrations.map((registration) => [
        registration.registrationNo,
        registration.dogId,
      ]),
    );
    log(`Indexed dogs by registration: ${dogIdByRegistration.size}`);
    finishStage("index");

    startStage("shows");
    const showUpsertResult = await upsertShowRows(
      showRows,
      dogIdByRegistration,
      {
        importRunId: run.id,
        onProgress: (processed, total) =>
          logProgress("shows", processed, total),
      },
    );
    showResultsUpserted = showUpsertResult.upserted;
    errorsCount += showUpsertResult.errors;
    for (const issue of showUpsertResult.issues) {
      await recordIssue({
        stage: "shows",
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
        registrationNo: issue.registrationNo,
        sourceTable: issue.sourceTable,
        payloadJson: issue.payloadJson,
      });
    }
    log(
      `Show results upserted=${showResultsUpserted}, show errors=${showUpsertResult.errors}`,
    );
    finishStage("shows");

    await flushIssueBuffer();

    const finished = await markImportRunFinished(
      run.id,
      {
        status: "SUCCEEDED",
        dogsUpserted: 0,
        ownersUpserted: 0,
        ownershipsUpserted: 0,
        trialResultsUpserted: 0,
        showResultsUpserted,
        errorsCount,
        errorSummary: formatLegacyImportSummary({
          kind: "LEGACY_PHASE3",
          showResultsUpserted,
          errorsCount,
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
        trialResultsUpserted: 0,
        showResultsUpserted,
        errorsCount: errorsCount + 1,
        errorSummary: message,
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
