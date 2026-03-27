import type { AdminShowWorkbookImportIssue } from "./preview-workbook-import";

export type AdminShowWorkbookImportApplyResponse = {
  success: boolean;
  eventsCreated: number;
  entriesCreated: number;
  itemsCreated: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  issues: AdminShowWorkbookImportIssue[];
};
