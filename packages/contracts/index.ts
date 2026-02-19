export type Role = "USER" | "ADMIN";

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiError = {
  ok: false;
  error: string;
  code?: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export type CurrentUserDto = {
  id: string;
  email: string;
  username: string | null;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  username?: string;
};

export type LogoutResponse = {
  success: true;
};

export type ImportStatusResponse = {
  info: string;
};

export type ImportRunKind = "LEGACY_PHASE1";

export type ImportRunStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED";

export type ImportRunResponse = {
  id: string;
  kind: ImportRunKind;
  status: ImportRunStatus;
  dogsUpserted: number;
  ownersUpserted: number;
  ownershipsUpserted: number;
  trialResultsUpserted: number;
  showResultsUpserted: number;
  errorsCount: number;
  startedAt: string | null;
  finishedAt: string | null;
  errorSummary: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  issuesCount: number;
};

export type ImportIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type ImportRunIssueResponse = {
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
  createdAt: string;
};

export type ImportRunIssuesResponse = {
  items: ImportRunIssueResponse[];
  nextCursor: string | null;
};

export type {
  BeagleNewestRequest,
  BeagleNewestResponse,
  BeagleSearchMode,
  BeagleSearchRequest,
  BeagleSearchResponse,
  BeagleSearchRow,
  BeagleSearchSex,
  BeagleSearchSort,
} from "./dogs";

export type {
  AdminUserListItem,
  AdminUsersResponse,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
} from "./admin";
export type { HomeStatisticsResponse } from "./home";
