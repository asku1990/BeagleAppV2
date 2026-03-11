import type { ImportRunIssueRow, ImportRunSummary } from "@beagle/db";
import type {
  ImportRunIssueResponse,
  ImportRunResponse,
} from "@beagle/contracts";

export function toImportRunResponse(run: ImportRunSummary): ImportRunResponse {
  return {
    id: run.id,
    kind: run.kind,
    status: run.status,
    dogsUpserted: run.dogsUpserted,
    ownersUpserted: run.ownersUpserted,
    ownershipsUpserted: run.ownershipsUpserted,
    trialResultsUpserted: run.trialResultsUpserted,
    showResultsUpserted: run.showResultsUpserted,
    errorsCount: run.errorsCount,
    startedAt: run.startedAt?.toISOString() ?? null,
    finishedAt: run.finishedAt?.toISOString() ?? null,
    errorSummary: run.errorSummary,
    createdByUserId: run.createdByUserId,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
    issuesCount: run.issuesCount,
  };
}

export function toImportRunIssueResponse(
  issue: ImportRunIssueRow,
): ImportRunIssueResponse {
  return {
    id: issue.id,
    importRunId: issue.importRunId,
    stage: issue.stage,
    severity: issue.severity,
    code: issue.code,
    message: issue.message,
    registrationNo: issue.registrationNo,
    sourceRowId: issue.sourceRowId,
    sourceTable: issue.sourceTable,
    payloadJson: issue.payloadJson,
    createdAt: issue.createdAt.toISOString(),
  };
}
