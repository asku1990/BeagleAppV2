import * as XLSX from "xlsx";
import { prisma } from "@beagle/db";
import {
  isNonEmptyWorkbookRow,
  normalizeWorkbookComparisonToken,
  normalizeWorkbookTextCell,
} from "./cell";
import type {
  WorkbookColumnMap,
  WorkbookLookupData,
  WorkbookRow,
} from "./workbook-preview-types";

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

export function getCell(
  row: WorkbookRow,
  columnMap: WorkbookColumnMap,
  column: string,
): WorkbookRow[number] {
  const index = columnMap.get(normalizeWorkbookComparisonToken(column));
  return index === undefined ? null : (row[index] ?? null);
}

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

export function parseWorkbookBuffer(
  buffer: Buffer | Uint8Array | ArrayBuffer,
): {
  sheetName: string;
  headers: WorkbookRow;
  rows: WorkbookRow[];
} {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
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
  return { sheetName, headers, rows };
}

export async function loadLookupData(): Promise<WorkbookLookupData> {
  const [registrations, definitions] = await Promise.all([
    prisma.dogRegistration.findMany({
      select: { registrationNo: true, dogId: true },
    }),
    prisma.showResultDefinition.findMany({
      select: { code: true, isEnabled: true, valueType: true },
    }),
  ]);

  const definitionsByCode = new Map(
    definitions.map((definition) => [definition.code, definition]),
  );
  return {
    dogIdByRegistration: new Map(
      registrations.map((registration) => [
        registration.registrationNo,
        registration.dogId,
      ]),
    ),
    enabledDefinitionCodes: new Set(
      definitions
        .filter((definition) => definition.isEnabled)
        .map((definition) => definition.code),
    ),
    definitionsByCode,
    definitionCount: definitions.length,
  };
}
