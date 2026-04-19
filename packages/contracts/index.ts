export type Role = "USER" | "ADMIN";

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiError = {
  ok: false;
  error: string;
  code?: string;
  details?: unknown;
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

export type ImportRunKind =
  | "LEGACY_PHASE1"
  | "LEGACY_PHASE1_5"
  | "LEGACY_PHASE2"
  | "LEGACY_PHASE3";

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
  BeagleDogProfileDto,
  BeagleDogProfileLitterDto,
  BeagleDogProfileOffspringRowDto,
  BeagleDogProfileOffspringSummaryDto,
  BeagleDogProfileParentDto,
  BeagleDogProfilePedigreeCardDto,
  BeagleDogProfilePedigreeGenerationDto,
  BeagleDogProfileSex,
  BeagleDogProfileShowRowDto,
  BeagleDogProfileSiblingRowDto,
  BeagleDogProfileSiblingsSummaryDto,
  BeagleDogProfileTitleRowDto,
  BeagleDogProfileTrialRowDto,
} from "./dogs";
export type {
  BeagleShowDetailsEvent,
  BeagleShowDetailsRequest,
  BeagleShowDetailsResponse,
  BeagleShowDetailsRow,
  BeagleShowStructuredResultDto,
  BeagleShowSearchFilters,
  BeagleShowSearchMode,
  BeagleShowSearchRequest,
  BeagleShowSearchResponse,
  BeagleShowSearchRow,
  BeagleShowSearchSort,
} from "./shows";
export type {
  BeagleTrialDetailsEvent,
  BeagleTrialDetailsRequest,
  BeagleTrialDetailsResponse,
  BeagleTrialDetailsRow,
  BeagleTrialSearchFilters,
  BeagleTrialSearchMode,
  BeagleTrialSearchRequest,
  BeagleTrialSearchResponse,
  BeagleTrialSearchRow,
  BeagleTrialSearchSort,
  TrialDogPdfAjoajanPisteytys,
  TrialDogPdfAnsiopisteet,
  TrialDogPdfDataRequest,
  TrialDogPdfKokeenTiedot,
  TrialDogPdfKoiranTausta,
  TrialDogPdfKoiranTiedot,
  TrialDogPdfHuomautus,
  TrialDogPdfPayload,
  TrialDogPdfPayloadWithTrialId,
  TrialDogPdfTappiopisteet,
  TrialDogPdfLoppupisteet,
  TrialDogSex,
  KoiratietokantaAjokUpsertRequest,
  KoiratietokantaAjokUpsertResponse,
  KoiratietokantaAjokValidationIssue,
  KoiratietokantaAjokWarning,
  KoiratietokantaAjokWarningCode,
} from "./trials";

export type {
  AdminUserListItem,
  AdminUsersResponse,
  CreateAdminUserRequest,
  CreateAdminUserResponse,
  DeleteAdminUserRequest,
  DeleteAdminUserResponse,
  AdminUserStatus,
  SetAdminUserStatusRequest,
  SetAdminUserStatusResponse,
  SetAdminUserPasswordRequest,
  SetAdminUserPasswordResponse,
  AdminDogListItem,
  AdminDogListRequest,
  AdminDogListResponse,
  AdminDogListSex,
  AdminDogListSort,
  AdminDogParentPreview,
  AdminDogTitleInput,
  AdminDogTitleItem,
  CreateAdminDogRequest,
  CreateAdminDogResponse,
  UpdateAdminDogRequest,
  UpdateAdminDogResponse,
  DeleteAdminDogRequest,
  DeleteAdminDogResponse,
  AdminDogLookupRequest,
  AdminBreederLookupOption,
  AdminOwnerLookupOption,
  AdminDogParentLookupOption,
  AdminBreederLookupResponse,
  AdminOwnerLookupResponse,
  AdminDogParentLookupResponse,
  AdminShowDetailsEvent,
  AdminShowDetailsRequest,
  AdminShowDetailsResponse,
  AdminShowEntry,
  AdminShowResultOption,
  AdminShowResultOptions,
  AdminShowEventSummary,
  AdminShowSearchRequest,
  AdminShowSearchResponse,
  AdminShowSearchSort,
  UpdateAdminShowEventRequest,
  UpdateAdminShowEventResponse,
  UpdateAdminShowEntryRequest,
  UpdateAdminShowEntryResponse,
  DeleteAdminShowEntryRequest,
  DeleteAdminShowEntryResponse,
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportIssueSeverity,
  AdminShowWorkbookImportApplyResponse,
  AdminShowWorkbookImportPreviewEntry,
  AdminShowWorkbookImportPreviewEvent,
  AdminShowWorkbookImportPreviewItem,
  AdminShowWorkbookImportResolvedSchema,
  AdminShowWorkbookImportSchemaBlockedColumn,
  AdminShowWorkbookImportSchemaBlockedColumnReasonCode,
  AdminShowWorkbookImportSchemaCoverage,
  AdminShowWorkbookImportSchemaDefinitionColumn,
  AdminShowWorkbookImportSchemaIgnoredColumn,
  AdminShowWorkbookImportSchemaMissingField,
  AdminShowWorkbookImportSchemaStructuralColumn,
  AdminShowWorkbookImportPreviewResponse,
  AdminShowWorkbookSchemaDestinationKind,
  AdminShowWorkbookSchemaParseMode,
  AdminShowWorkbookSchemaRule,
  AdminShowWorkbookSchemaRuleDraft,
  AdminShowWorkbookSchemaRulePolicy,
  AdminShowWorkbookSchemaTargetField,
  AdminShowWorkbookSchemaValidationError,
  AdminShowWorkbookSchemaValueMap,
  ListAdminShowWorkbookSchemaResponse,
  UpdateAdminShowWorkbookSchemaRuleRequest,
  UpdateAdminShowWorkbookSchemaRuleResponse,
  ValidateAdminShowWorkbookSchemaRuleRequest,
  ValidateAdminShowWorkbookSchemaRuleResponse,
  AdminTrialDetails,
  AdminTrialDetailsRequest,
  AdminTrialDetailsResponse,
  AdminTrialSearchRequest,
  AdminTrialSearchResponse,
  AdminTrialSearchSort,
  AdminTrialSummary,
} from "./admin";
export type { HomeStatisticsResponse } from "./home";
export {
  isValidEmailAddress,
  normalizeAndValidateEmailAddress,
  normalizeEmailAddress,
  isValidPasswordLength,
  normalizeAndValidatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./validation";
