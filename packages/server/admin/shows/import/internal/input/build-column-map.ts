import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookTextCell,
} from "../cell";
import type { WorkbookColumnMap, WorkbookRow } from "../workbook-preview-types";

// Builds a normalized workbook header index used by row and schema stages.
function normalizeHeaderCell(value: WorkbookRow[number]): string | null {
  const text = normalizeWorkbookTextCell(value);
  return text ? normalizeWorkbookComparisonToken(text) : null;
}

export function buildColumnMap(headers: WorkbookRow): WorkbookColumnMap {
  const map = new Map<string, number>();
  headers.forEach((headerValue, index) => {
    const header = normalizeHeaderCell(headerValue);
    if (!header || map.has(header)) {
      return;
    }
    map.set(header, index);
  });
  return map;
}
