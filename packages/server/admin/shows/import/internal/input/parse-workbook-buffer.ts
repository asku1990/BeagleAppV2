import * as XLSX from "xlsx";
import { isNonEmptyWorkbookRow } from "../cell";
import type { WorkbookRow } from "../workbook-preview-types";

// Parses the first workbook sheet into header and non-empty row matrices.
export function parseWorkbookBuffer(
  buffer: Buffer | Uint8Array | ArrayBuffer,
): {
  sheetName: string;
  headers: WorkbookRow;
  rows: WorkbookRow[];
  date1904: boolean;
} {
  // Keep Excel date cells as numeric serials to avoid timezone shifts.
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("Workbook does not contain any sheets.");
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("Workbook sheet is missing.");
  }

  const matrix = XLSX.utils.sheet_to_json<WorkbookRow>(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  const headers = matrix[0] ?? [];
  const rows = matrix.slice(1).filter(isNonEmptyWorkbookRow);
  const date1904 = workbook.Workbook?.WBProps?.date1904 === true;
  return { sheetName, headers, rows, date1904 };
}
