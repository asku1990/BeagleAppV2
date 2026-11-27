import * as XLSX from "xlsx";

export type Cell = string | number | boolean | Date | null | undefined;

const MAX_SOURCE_ROWS = 10_000;
const MAX_COLUMNS = 64;
const MAX_POPULATED_CELLS = 100_000;

function populatedCell(cell: unknown): cell is { v?: Cell; f?: string } {
  return (
    typeof cell === "object" &&
    cell !== null &&
    (("v" in cell && cell.v !== undefined) ||
      ("f" in cell && typeof cell.f === "string"))
  );
}

/** Collects populated cells by their zero-based Excel row, ignoring the sheet range. */
export function readSparseWorksheet(sheet: XLSX.WorkSheet) {
  const rows = new Map<number, Cell[]>();
  let populatedCells = 0;
  let columnCount = 0;

  for (const address in sheet) {
    if (!Object.hasOwn(sheet, address) || address.startsWith("!")) continue;
    const cell: unknown = sheet[address];
    if (!populatedCell(cell)) continue;

    const { r, c } = XLSX.utils.decode_cell(address);
    if (r < 0 || c < 0) continue;
    populatedCells += 1;
    if (c >= MAX_COLUMNS || populatedCells > MAX_POPULATED_CELLS) return null;
    columnCount = Math.max(columnCount, c + 1);

    const row = rows.get(r) ?? [];
    row[c] = cell.v ?? null;
    rows.set(r, row);
    if (rows.size - Number(rows.has(0)) > MAX_SOURCE_ROWS) return null;
  }

  return { rows, columnCount };
}
