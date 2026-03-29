import { ISSUE_CODES } from "../workbook-preview-constants";
import { createIssue } from "../workbook-preview-mappers";
import type { WorkbookResolvedSchema } from "../workbook-preview-types";

// Converts resolved schema mismatches into the stable issue payloads used by preview/apply.
export function buildWorkbookSchemaIssues(schema: WorkbookResolvedSchema) {
  const issues = schema.missingRequiredFields.map((field) =>
    createIssue({
      rowNumber: 1,
      columnName: field.label,
      severity: "ERROR",
      code: ISSUE_CODES.missingRequiredField,
      message: `Missing required workbook column: ${field.label}.`,
      registrationNo: null,
      eventLookupKey: null,
    }),
  );

  for (const column of schema.ignoredColumns) {
    issues.push(
      createIssue({
        rowNumber: 1,
        columnName: column.headerName,
        severity: "INFO",
        code: ISSUE_CODES.columnIgnored,
        message: column.reasonText,
        registrationNo: null,
        eventLookupKey: null,
      }),
    );
  }

  for (const column of schema.blockedColumns) {
    let code: string = ISSUE_CODES.unsupportedColumn;
    if (column.reasonCode === "DUPLICATE_HEADER") {
      code = ISSUE_CODES.duplicateHeader;
    } else if (column.reasonCode === "UNNAMED_COLUMN_WITH_DATA") {
      code = ISSUE_CODES.unnamedColumnWithData;
    } else if (
      column.reasonCode === "DISABLED_DEFINITION" ||
      column.reasonCode === "MISSING_DEFINITION"
    ) {
      code = ISSUE_CODES.definitionMissing;
    } else if (column.reasonCode === "UNSUPPORTED_VALUE_TYPE") {
      code = ISSUE_CODES.unsupportedDefinitionColumn;
    }

    issues.push(
      createIssue({
        rowNumber: 1,
        columnName: column.headerName,
        severity: "ERROR",
        code,
        message: column.reasonText,
        registrationNo: null,
        eventLookupKey: null,
      }),
    );
  }

  return issues;
}
