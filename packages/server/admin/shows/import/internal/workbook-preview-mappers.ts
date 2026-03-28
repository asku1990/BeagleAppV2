import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookLookupText,
  normalizeWorkbookTextCell,
} from "./cell";
import { ISSUE_CODES } from "./workbook-preview-constants";
import type { WorkbookIssueInput, WorkbookRow } from "./workbook-preview-types";

export function normalizeAllowedValue(
  allowedValues: Readonly<Record<string, string>>,
  value: string,
): string | null {
  const normalizedValue = normalizeWorkbookComparisonToken(value);

  for (const [candidate, canonical] of Object.entries(allowedValues)) {
    if (normalizeWorkbookComparisonToken(candidate) === normalizedValue) {
      return canonical;
    }
  }

  return null;
}

export function parsePupnValue(value: WorkbookRow[number]): string | null {
  const text = normalizeWorkbookTextCell(value);
  if (!text) {
    return null;
  }

  return /^((?:PU|PN)\d+)$/iu.test(text) ? text.toUpperCase() : null;
}

export function buildEventLookupKey(parts: {
  eventDateIso: string;
  eventCity: string;
  eventPlace: string;
  eventType: string;
}): string {
  return [
    parts.eventDateIso,
    normalizeWorkbookLookupText(parts.eventCity),
    normalizeWorkbookLookupText(parts.eventPlace),
    normalizeWorkbookLookupText(parts.eventType),
  ].join("|");
}

export function createIssue(
  input: WorkbookIssueInput,
): AdminShowWorkbookImportIssue {
  return input;
}

export function buildMissingValueIssues(
  rowNumber: number,
  registrationNo: string | null,
  fields: Array<[string, string | null]>,
): AdminShowWorkbookImportIssue[] {
  return fields.flatMap(([columnName, value]) => {
    if (value) {
      return [];
    }

    return [
      createIssue({
        rowNumber,
        columnName,
        severity: "ERROR",
        code: ISSUE_CODES.missingColumns,
        message: `${columnName} is required.`,
        registrationNo,
        eventLookupKey: null,
      }),
    ];
  });
}

export function addDefinitionIssue(
  issues: AdminShowWorkbookImportIssue[],
  input: {
    rowNumber: number;
    columnName: string | null;
    code: string;
    message: string;
    registrationNo: string | null;
    eventLookupKey: string | null;
  },
) {
  issues.push(
    createIssue({
      rowNumber: input.rowNumber,
      columnName: input.columnName,
      severity: "ERROR",
      code: input.code,
      message: input.message,
      registrationNo: input.registrationNo,
      eventLookupKey: input.eventLookupKey,
    }),
  );
}
