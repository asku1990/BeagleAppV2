import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import { buildPreviewEvents } from "../preview/build-preview-events";
import type {
  WorkbookParsedRow,
  WorkbookResolvedSchema,
} from "../workbook-preview-types";

// Produces the stable runtime summary consumed by preview and apply use-cases.
export type WorkbookImportRuntimeSuccess = {
  ok: true;
  sheetName: string;
  rows: WorkbookParsedRow[];
  issues: AdminShowWorkbookImportIssue[];
  schema: WorkbookResolvedSchema;
  rowCount: number;
  acceptedRowCount: number;
  rejectedRowCount: number;
  eventCount: number;
  entryCount: number;
  resultItemCount: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  events: ReturnType<typeof buildPreviewEvents>;
};

export function countIssueSeverity(issues: { severity: string }[]): {
  infoCount: number;
  warningCount: number;
  errorCount: number;
} {
  let infoCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const issue of issues) {
    if (issue.severity === "INFO") {
      infoCount += 1;
    } else if (issue.severity === "WARNING") {
      warningCount += 1;
    } else {
      errorCount += 1;
    }
  }

  return { infoCount, warningCount, errorCount };
}

export function summarizeWorkbookImport(input: {
  sheetName: string;
  rows: WorkbookParsedRow[];
  issues: AdminShowWorkbookImportIssue[];
  schema: WorkbookResolvedSchema;
}): WorkbookImportRuntimeSuccess {
  const counts = countIssueSeverity(input.issues);
  const acceptedRows = input.rows.filter((row) => row.accepted);
  const rejectedRows = input.rows.length - acceptedRows.length;

  return {
    ok: true,
    sheetName: input.sheetName,
    rows: input.rows,
    issues: input.issues,
    schema: input.schema,
    rowCount: input.rows.length,
    acceptedRowCount: acceptedRows.length,
    rejectedRowCount: rejectedRows,
    eventCount: new Set(acceptedRows.map((row) => row.eventLookupKey)).size,
    entryCount: acceptedRows.length,
    resultItemCount: acceptedRows.reduce((sum, row) => sum + row.itemCount, 0),
    infoCount: counts.infoCount,
    warningCount: counts.warningCount,
    errorCount: counts.errorCount,
    events: buildPreviewEvents(input.rows),
  };
}
