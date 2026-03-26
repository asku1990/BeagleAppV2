export type AdminShowWorkbookImportIssueSeverity = "INFO" | "WARNING" | "ERROR";

export type AdminShowWorkbookImportIssue = {
  rowNumber: number | null;
  columnName: string | null;
  severity: AdminShowWorkbookImportIssueSeverity;
  code: string;
  message: string;
  registrationNo: string | null;
  eventLookupKey: string | null;
};

export type AdminShowWorkbookImportPreviewItem = {
  columnName: string;
  definitionCode: string;
  valueCode: string | null;
  valueNumeric: number | null;
};

export type AdminShowWorkbookImportPreviewEntry = {
  rowNumber: number;
  registrationNo: string;
  dogName: string;
  dogMatched: boolean;
  status: "ACCEPTED" | "REJECTED";
  issueCount: number;
  judge: string | null;
  critiqueText: string | null;
  classValue: string;
  qualityValue: string;
  resultItems: AdminShowWorkbookImportPreviewItem[];
};

export type AdminShowWorkbookImportPreviewEvent = {
  eventLookupKey: string;
  groupLabel: string;
  eventDateIso: string;
  eventCity: string;
  eventPlace: string;
  eventType: string;
  entries: AdminShowWorkbookImportPreviewEntry[];
};

export type AdminShowWorkbookImportSchemaStructuralColumn = {
  fieldKey: string;
  expectedHeader: string;
  headerName: string;
  required: boolean;
};

export type AdminShowWorkbookImportSchemaMissingField = {
  fieldKey: string;
  expectedHeader: string;
  required: boolean;
};

export type AdminShowWorkbookImportSchemaDefinitionColumn = {
  headerName: string;
  definitionCodes: string[];
  importMode: "VALUE_MAP" | "DIRECT" | "NUMERIC" | "PUPN";
  valueType: "FLAG" | "CODE" | "TEXT" | "NUMERIC" | "DATE";
  enabled: boolean;
  supported: boolean;
};

export type AdminShowWorkbookImportSchemaBlockedColumnReasonCode =
  | "UNSUPPORTED_COLUMN"
  | "DUPLICATE_HEADER"
  | "UNNAMED_COLUMN_WITH_DATA"
  | "MISSING_DEFINITION"
  | "DISABLED_DEFINITION"
  | "UNSUPPORTED_VALUE_TYPE";

export type AdminShowWorkbookImportSchemaBlockedColumn = {
  headerName: string;
  columnIndex: number;
  reasonCode: AdminShowWorkbookImportSchemaBlockedColumnReasonCode;
  reasonText: string;
};

export type AdminShowWorkbookImportSchemaIgnoredColumn = {
  headerName: string;
  columnIndex: number;
  ruleCode: string;
  reasonText: string;
};

export type AdminShowWorkbookImportSchemaCoverage = {
  totalWorkbookColumns: number;
  importedColumnCount: number;
  ignoredColumnCount: number;
  blockedColumnCount: number;
};

export type AdminShowWorkbookImportResolvedSchema = {
  structuralColumns: AdminShowWorkbookImportSchemaStructuralColumn[];
  missingStructuralFields: AdminShowWorkbookImportSchemaMissingField[];
  definitionColumns: AdminShowWorkbookImportSchemaDefinitionColumn[];
  ignoredColumns: AdminShowWorkbookImportSchemaIgnoredColumn[];
  blockedColumns: AdminShowWorkbookImportSchemaBlockedColumn[];
  coverage: AdminShowWorkbookImportSchemaCoverage;
};

export type AdminShowWorkbookImportPreviewResponse = {
  fileName: string;
  sheetName: string;
  rowCount: number;
  acceptedRowCount: number;
  rejectedRowCount: number;
  eventCount: number;
  entryCount: number;
  resultItemCount: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  schema: AdminShowWorkbookImportResolvedSchema;
  issues: AdminShowWorkbookImportIssue[];
  events: AdminShowWorkbookImportPreviewEvent[];
};
