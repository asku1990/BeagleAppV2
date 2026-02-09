export {
  DogSex,
  ImportKind,
  ImportStatus,
  Role,
  type User,
} from "@prisma/client";

export { prisma } from "./core/prisma";

export {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  findUserBySessionToken,
} from "./auth/repository";

export {
  createImportRunIssue,
  createImportRunIssuesBulk,
  createImportRun,
  getImportRunById,
  listImportRunIssues,
  markImportRunFinished,
  markImportRunRunning,
  type CreateImportRunIssueInput,
  type ImportIssueSeverity,
  type ImportRunIssueRow,
  type ImportRunSummary,
} from "./imports/repository";

export {
  fetchLegacyPhase1Rows,
  type LegacyDogRow,
  type LegacyEkRow,
  type LegacyEventRow,
  type LegacyOwnerRow,
  type LegacySamakoiraRow,
  type LegacyPhase1Rows,
} from "./legacy/source";
