import {
  DogSex,
  type ImportRunIssueRow,
  type ImportRunSummary,
} from "@beagle/db";
import type {
  ImportRunIssueResponse,
  ImportRunResponse,
} from "@beagle/contracts";

export function parseLegacyDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{8}$/.test(trimmed)) return null;
  const year = Number.parseInt(trimmed.slice(0, 4), 10);
  const month = Number.parseInt(trimmed.slice(4, 6), 10);
  const day = Number.parseInt(trimmed.slice(6, 8), 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

export function mapSex(value: string | null | undefined): DogSex {
  if (value === "U") return DogSex.MALE;
  if (value === "N") return DogSex.FEMALE;
  return DogSex.UNKNOWN;
}

export function normalizeNullable(
  value: string | null | undefined,
): string | null {
  const next = value?.trim();
  return next ? next : null;
}

const REGISTRATION_NO_PATTERN = /^[\p{L}\p{N}/.-]+$/u;

export function normalizeRegistrationNo(
  value: string | null | undefined,
): string | null {
  const normalized = normalizeNullable(value);
  return normalized ? normalized.toUpperCase() : null;
}

export function isValidRegistrationNo(value: string): boolean {
  return REGISTRATION_NO_PATTERN.test(value);
}

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
