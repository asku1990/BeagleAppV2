import type { WorkbookParsedRow } from "../workbook-preview-types";

// Applies the standard rejection state transition for parsed workbook rows.
export function rejectParsedRow(row: WorkbookParsedRow) {
  row.accepted = false;
  row.issueCount += 1;
  row.itemCount = 0;
  row.resultItems = [];
}
