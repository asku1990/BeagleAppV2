import {
  type AuditContextDb,
  ImportKind,
  createImportRun,
  createImportRunIssue,
  createImportRunIssuesBulk,
  fetchLegacyShowRows,
  markImportRunFinished,
  markImportRunRunning,
  prisma,
} from "@beagle/db";
import type { ImportIssueSeverity } from "@beagle/db";
import type { ImportRunResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../core/result";
import { getShowTokenCoverageReport, upsertShowRows } from "../internal";
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
  const strictSourceCoverage =
    process.env.IMPORT_PHASE3_STRICT_SOURCE_COVERAGE === "1";
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

    startStage("preflight-source");
    const coverageReport = await getShowTokenCoverageReport(showRows);
    if (
      coverageReport.unmapped.length > 0 ||
      coverageReport.missingDefinitionCodes.length > 0
    ) {
      const unmappedTop = coverageReport.unmapped.slice(0, 20);
      const message = strictSourceCoverage
        ? `Show source coverage failed: unmappedDistinctTokens=${coverageReport.unmapped.length}, unmappedOccurrences=${coverageReport.unmappedOccurrences}, missingDefinitionCodes=${coverageReport.missingDefinitionCodes.length}.`
        : `Show source coverage has gaps (continuing): unmappedDistinctTokens=${coverageReport.unmapped.length}, unmappedOccurrences=${coverageReport.unmappedOccurrences}, missingDefinitionCodes=${coverageReport.missingDefinitionCodes.length}.`;
      const preflightSeverity: ImportIssueSeverity = strictSourceCoverage
        ? "ERROR"
        : "WARNING";
      const detailedPreflightIssues = [
        ...coverageReport.unmapped.map((item) => ({
          stage: "preflight-source" as const,
          severity: preflightSeverity,
          code: "SHOW_RESULT_TOKEN_UNMAPPED",
          message: `Unmapped source token=${item.token}, occurrences=${item.count}.`,
          registrationNo: item.samples[0]?.registrationNo ?? null,
          sourceTable: item.samples[0]?.sourceTable ?? null,
          payloadJson: JSON.stringify({
            token: item.token,
            count: item.count,
            samples: item.samples,
          }),
        })),
        ...coverageReport.missingDefinitionCodes.map((code) => ({
          stage: "preflight-source" as const,
          severity: preflightSeverity,
          code: "SHOW_RESULT_DEFINITION_NOT_FOUND",
          message: `Definition code missing from enabled ShowResultDefinition rows: ${code}.`,
          registrationNo: null,
          sourceTable: null,
          payloadJson: JSON.stringify({ definitionCode: code }),
        })),
      ];
      if (detailedPreflightIssues.length > 0) {
        await createImportRunIssuesBulk(
          run.id,
          detailedPreflightIssues,
          auditContext,
        );
      }
      await createImportRunIssue(
        run.id,
        {
          stage: "preflight-source",
          severity: preflightSeverity,
          code: "IMPORT_CONFIGURATION_UNMAPPED_SHOW_TOKENS",
          message,
          payloadJson: JSON.stringify({
            totalDistinctTokens: coverageReport.totalDistinctTokens,
            mappedDistinctTokens: coverageReport.mappedDistinctTokens,
            unmappedDistinctTokens: coverageReport.unmapped.length,
            unmappedOccurrences: coverageReport.unmappedOccurrences,
            unmappedTop,
            missingDefinitionCodes: coverageReport.missingDefinitionCodes,
          }),
        },
        auditContext,
      );
      if (strictSourceCoverage) {
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
          status: 500,
          body: {
            ok: false,
            code: "IMPORT_FAILED",
            error: `Import run failed (runId=${finished.id}): ${message}`,
          },
        };
      }
    }
    finishStage("preflight-source");

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
    const showResult = await upsertShowRows(showRows, dogIdByRegistration, {
      importRunId: run.id,
      onProgress: (processed, total) => logProgress("shows", processed, total),
    });
    showResultsUpserted = showResult.upserted;
    errorsCount += showResult.errors;
    for (const issue of showResult.issues) {
      await recordIssue({
        stage: "shows",
        code: issue.code,
        message: issue.message,
        registrationNo: issue.registrationNo,
        sourceTable: issue.sourceTable,
        payloadJson: issue.payloadJson,
      });
    }
    log(
      `Show results upserted=${showResultsUpserted}, show errors=${showResult.errors}`,
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
        errorSummary:
          errorsCount > 0 ? "Import completed with warnings." : null,
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
