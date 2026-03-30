import { normalizeWorkbookComparisonToken } from "../cell";
import type { WorkbookColumnMap, WorkbookRow } from "../workbook-preview-types";

export function getCell(
  row: WorkbookRow,
  columnMap: WorkbookColumnMap,
  column: string,
): WorkbookRow[number] {
  const index = columnMap.get(normalizeWorkbookComparisonToken(column));
  return index === undefined ? null : (row[index] ?? null);
}
