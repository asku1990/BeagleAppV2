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
