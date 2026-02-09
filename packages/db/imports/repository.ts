import { ImportKind, ImportStatus } from "@prisma/client";
import { prisma } from "../core/prisma";

const IMPORT_ERROR_SUMMARY_MAX_LEN = 180;

function normalizeErrorSummary(value?: string | null): string | null {
  if (!value) return null;
  return value.slice(0, IMPORT_ERROR_SUMMARY_MAX_LEN);
}

type PrismaKnownError = {
  code?: string;
};

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

export class InvalidImportRunIssuesCursorError extends Error {
  constructor() {
    super("Invalid cursor.");
    this.name = "InvalidImportRunIssuesCursorError";
  }
}

export function isInvalidImportRunIssuesCursorError(
  error: unknown,
): error is InvalidImportRunIssuesCursorError {
  return error instanceof InvalidImportRunIssuesCursorError;
}

export type ImportRunSummary = {
  id: string;
  kind: ImportKind;
  status: ImportStatus;
  dogsUpserted: number;
  ownersUpserted: number;
  ownershipsUpserted: number;
  trialResultsUpserted: number;
  showResultsUpserted: number;
  errorsCount: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorSummary: string | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  issuesCount: number;
};

export type ImportRunIssueRow = {
  id: string;
  importRunId: string;
  stage: string;
  severity: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceRowId: number | null;
  sourceTable: string | null;
  payloadJson: string | null;
  createdAt: Date;
};

export type ImportIssueSeverity = "WARNING" | "ERROR";

export type CreateImportRunIssueInput = {
  stage: string;
  severity?: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo?: string | null;
  sourceRowId?: number | null;
  sourceTable?: string | null;
  payloadJson?: string | null;
};

type ImportRunIssueDelegate = {
  count(args: { where: { importRunId: string } }): Promise<number>;
  create(args: {
    data: {
      importRunId: string;
      stage: string;
      severity: ImportIssueSeverity;
      code: string;
      message: string;
      registrationNo: string | null;
      sourceRowId: number | null;
      sourceTable: string | null;
      payloadJson: string | null;
    };
  }): Promise<ImportRunIssueRow>;
  createMany(args: {
    data: Array<{
      importRunId: string;
      stage: string;
      severity: ImportIssueSeverity;
      code: string;
      message: string;
      registrationNo: string | null;
      sourceRowId: number | null;
      sourceTable: string | null;
      payloadJson: string | null;
    }>;
  }): Promise<{ count: number }>;
  findMany(args: {
    where: {
      importRunId: string;
      stage?: string;
      code?: string;
    };
    orderBy: Array<{ createdAt: "asc" } | { id: "asc" }>;
    take: number;
    cursor?: { id: string };
    skip?: number;
  }): Promise<ImportRunIssueRow[]>;
};

function getImportRunIssueDelegate(): ImportRunIssueDelegate {
  return (prisma as unknown as { importRunIssue: ImportRunIssueDelegate })
    .importRunIssue;
}

function toImportRunSummary(run: {
  id: string;
  kind: ImportKind;
  status: ImportStatus;
  dogsUpserted: number;
  ownersUpserted: number;
  ownershipsUpserted: number;
  trialResultsUpserted: number;
  showResultsUpserted: number;
  errorsCount: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorSummary: string | null;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { issues: number };
}): ImportRunSummary {
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
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    errorSummary: run.errorSummary,
    createdByUserId: run.createdByUserId,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    issuesCount: run._count?.issues ?? 0,
  };
}

export async function createImportRun(input: {
  kind: ImportKind;
  createdByUserId?: string;
}): Promise<ImportRunSummary> {
  const run = await prisma.importRun.create({
    data: {
      kind: input.kind,
      status: ImportStatus.PENDING,
      createdByUserId: input.createdByUserId,
    },
  });
  return toImportRunSummary(run);
}

export async function markImportRunRunning(id: string) {
  return prisma.importRun.update({
    where: { id },
    data: {
      status: ImportStatus.RUNNING,
      startedAt: new Date(),
      errorSummary: null,
    },
  });
}

export async function markImportRunFinished(
  id: string,
  input: {
    status: "SUCCEEDED" | "FAILED";
    dogsUpserted: number;
    ownersUpserted: number;
    ownershipsUpserted: number;
    trialResultsUpserted: number;
    showResultsUpserted: number;
    errorsCount: number;
    errorSummary?: string | null;
  },
) {
  const run = await prisma.importRun.update({
    where: { id },
    data: {
      status: input.status,
      dogsUpserted: input.dogsUpserted,
      ownersUpserted: input.ownersUpserted,
      ownershipsUpserted: input.ownershipsUpserted,
      trialResultsUpserted: input.trialResultsUpserted,
      showResultsUpserted: input.showResultsUpserted,
      errorsCount: input.errorsCount,
      finishedAt: new Date(),
      errorSummary: normalizeErrorSummary(input.errorSummary),
    },
  });
  const issuesCount = await getImportRunIssueDelegate().count({
    where: { importRunId: id },
  });
  return toImportRunSummary({ ...run, _count: { issues: issuesCount } });
}

export async function getImportRunById(
  id: string,
): Promise<ImportRunSummary | null> {
  const run = await prisma.importRun.findUnique({ where: { id } });
  if (!run) return null;
  const issuesCount = await getImportRunIssueDelegate().count({
    where: { importRunId: id },
  });
  return toImportRunSummary({ ...run, _count: { issues: issuesCount } });
}

export async function createImportRunIssue(
  importRunId: string,
  input: CreateImportRunIssueInput,
): Promise<ImportRunIssueRow> {
  return getImportRunIssueDelegate().create({
    data: {
      importRunId,
      stage: input.stage,
      severity: input.severity ?? "WARNING",
      code: input.code,
      message: input.message,
      registrationNo: input.registrationNo ?? null,
      sourceRowId: input.sourceRowId ?? null,
      sourceTable: input.sourceTable ?? null,
      payloadJson: input.payloadJson ?? null,
    },
  });
}

export async function createImportRunIssuesBulk(
  importRunId: string,
  issues: CreateImportRunIssueInput[],
): Promise<void> {
  if (issues.length === 0) return;
  await getImportRunIssueDelegate().createMany({
    data: issues.map((issue) => ({
      importRunId,
      stage: issue.stage,
      severity: issue.severity ?? "WARNING",
      code: issue.code,
      message: issue.message,
      registrationNo: issue.registrationNo ?? null,
      sourceRowId: issue.sourceRowId ?? null,
      sourceTable: issue.sourceTable ?? null,
      payloadJson: issue.payloadJson ?? null,
    })),
  });
}

export async function listImportRunIssues(
  importRunId: string,
  options?: {
    stage?: string;
    code?: string;
    limit?: number;
    cursor?: string;
  },
): Promise<{ items: ImportRunIssueRow[]; nextCursor: string | null }> {
  const rawLimit = options?.limit;
  const normalizedLimit =
    typeof rawLimit === "number" && Number.isFinite(rawLimit)
      ? Math.trunc(rawLimit)
      : 100;
  const limit = Math.min(Math.max(normalizedLimit, 1), 500);
  let items: ImportRunIssueRow[];
  try {
    items = await getImportRunIssueDelegate().findMany({
      where: {
        importRunId,
        stage: options?.stage,
        code: options?.code,
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: limit + 1,
      ...(options?.cursor
        ? {
            cursor: { id: options.cursor },
            skip: 1,
          }
        : {}),
    });
  } catch (error) {
    if (
      options?.cursor &&
      isPrismaKnownError(error) &&
      error.code === "P2025"
    ) {
      throw new InvalidImportRunIssuesCursorError();
    }
    throw error;
  }

  const hasMore = items.length > limit;
  const page = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

  return { items: page, nextCursor };
}
