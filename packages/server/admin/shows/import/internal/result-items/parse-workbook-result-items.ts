import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookInteger,
  normalizeWorkbookTextCell,
} from "../cell";
import {
  ISSUE_CODES,
  TRUTHY_WORKBOOK_TOKENS,
} from "../workbook-preview-constants";
import {
  addDefinitionIssue,
  normalizeAllowedValue,
  parsePupnValue,
} from "../workbook-preview-mappers";
import { getCell } from "../input/get-cell";
import type {
  WorkbookColumnMap,
  WorkbookDefinitionMeta,
  WorkbookResolvedSchema,
  WorkbookRow,
} from "../workbook-preview-types";

// Parses definition-backed result items after structural row fields are already normalized.
type BuildWorkbookPreviewItemsInput = {
  row: WorkbookRow;
  columnMap: WorkbookColumnMap;
  schema: WorkbookResolvedSchema;
  rowNumber: number;
  registrationNo: string;
  eventLookupKey: string;
  classValue: string;
  qualityValue: string;
  issues: AdminShowWorkbookImportIssue[];
  definitionsByCode: Map<string, WorkbookDefinitionMeta>;
};

function isTruthyWorkbookValue(
  rawValue: WorkbookRow[number],
  headerName: string,
): boolean {
  const value = normalizeWorkbookTextCell(rawValue);
  if (!value) {
    return false;
  }

  const token = normalizeWorkbookComparisonToken(value);
  if (
    token === normalizeWorkbookComparisonToken(headerName) ||
    TRUTHY_WORKBOOK_TOKENS.some((candidate) => candidate === token)
  ) {
    return true;
  }

  return false;
}

function resolveDefinitionCodeFromWorkbookValue(
  definitionsByCode: Map<string, WorkbookDefinitionMeta>,
  workbookValue: string,
  allowedCategoryCode: string | null,
): string | null {
  const token = normalizeWorkbookComparisonToken(workbookValue);

  for (const definition of definitionsByCode.values()) {
    if (!definition.isEnabled) {
      continue;
    }

    if (
      allowedCategoryCode &&
      definition.categoryCode !== allowedCategoryCode
    ) {
      continue;
    }

    if (normalizeWorkbookComparisonToken(definition.code) === token) {
      return definition.code;
    }
  }

  return null;
}

function addMissingRequiredResultValueIssue(input: {
  issues: AdminShowWorkbookImportIssue[];
  rowNumber: number;
  columnName: string;
  registrationNo: string;
  eventLookupKey: string;
}) {
  addDefinitionIssue(input.issues, {
    rowNumber: input.rowNumber,
    columnName: input.columnName,
    code: ISSUE_CODES.missingColumns,
    message: `${input.columnName} is required.`,
    registrationNo: input.registrationNo,
    eventLookupKey: input.eventLookupKey,
  });
}

function addDefinitionFromStructuralField(input: {
  field:
    | WorkbookResolvedSchema["structuralFields"]["classValue"]
    | WorkbookResolvedSchema["structuralFields"]["qualityValue"];
  value: string;
  fallbackColumnName: string;
  invalidValueMessage: string;
  rowNumber: number;
  registrationNo: string;
  eventLookupKey: string;
  definitionsByCode: Map<string, WorkbookDefinitionMeta>;
  issues: AdminShowWorkbookImportIssue[];
  resultItems: Array<{
    columnName: string;
    definitionCode: string;
    valueCode: string | null;
    valueNumeric: number | null;
  }>;
}) {
  const field = input.field;
  if (!field || field.parseMode !== "DEFINITION_FROM_CELL") {
    return;
  }

  const columnName = field.headerName ?? input.fallbackColumnName;
  const rawValue = input.value.trim();
  if (!rawValue) {
    if (field.rowValueRequired) {
      addMissingRequiredResultValueIssue({
        issues: input.issues,
        rowNumber: input.rowNumber,
        columnName,
        registrationNo: input.registrationNo,
        eventLookupKey: input.eventLookupKey,
      });
    }
    return;
  }

  const definitionCode = resolveDefinitionCodeFromWorkbookValue(
    input.definitionsByCode,
    rawValue,
    field.allowedDefinitionCategoryCode ?? null,
  );
  if (!definitionCode) {
    addDefinitionIssue(input.issues, {
      rowNumber: input.rowNumber,
      columnName,
      code: ISSUE_CODES.invalidResultValue,
      message: input.invalidValueMessage,
      registrationNo: input.registrationNo,
      eventLookupKey: input.eventLookupKey,
    });
    return;
  }

  input.resultItems.push({
    columnName,
    definitionCode,
    valueCode: null,
    valueNumeric: null,
  });
}

export function parseWorkbookResultItems({
  row,
  columnMap,
  schema,
  rowNumber,
  registrationNo,
  eventLookupKey,
  classValue,
  qualityValue,
  issues,
  definitionsByCode,
}: BuildWorkbookPreviewItemsInput) {
  const resultItems: Array<{
    columnName: string;
    definitionCode: string;
    valueCode: string | null;
    valueNumeric: number | null;
  }> = [];

  addDefinitionFromStructuralField({
    field: schema.structuralFields.classValue,
    value: classValue,
    fallbackColumnName: "Luokka",
    invalidValueMessage: `Unsupported class value: ${classValue}.`,
    rowNumber,
    registrationNo,
    eventLookupKey,
    definitionsByCode,
    issues,
    resultItems,
  });

  addDefinitionFromStructuralField({
    field: schema.structuralFields.qualityValue,
    value: qualityValue,
    fallbackColumnName: "Laatuarvostelu",
    invalidValueMessage: `Unsupported quality value: ${qualityValue}.`,
    rowNumber,
    registrationNo,
    eventLookupKey,
    definitionsByCode,
    issues,
    resultItems,
  });

  for (const column of schema.resultColumns) {
    if (column.parseMode === "FIXED_NUMERIC") {
      const placementValue = normalizeWorkbookInteger(
        getCell(row, columnMap, column.headerName),
      );
      if (placementValue === "INVALID") {
        addDefinitionIssue(issues, {
          rowNumber,
          columnName: column.headerName,
          code: ISSUE_CODES.invalidResultValue,
          message: `${column.headerName} must be a non-negative integer.`,
          registrationNo,
          eventLookupKey,
        });
      } else if (placementValue === null && column.rowValueRequired) {
        addMissingRequiredResultValueIssue({
          issues,
          rowNumber,
          columnName: column.headerName,
          registrationNo,
          eventLookupKey,
        });
      } else if (placementValue !== null) {
        resultItems.push({
          columnName: column.headerName,
          definitionCode: column.definitionCodes[0],
          valueCode: null,
          valueNumeric: placementValue,
        });
      }

      continue;
    }

    if (column.parseMode === "FIXED_CODE") {
      const pupnValue = parsePupnValue(
        getCell(row, columnMap, column.headerName),
      );
      if (pupnValue === null) {
        const rawPupn = normalizeWorkbookTextCell(
          getCell(row, columnMap, column.headerName),
        );
        if (rawPupn) {
          addDefinitionIssue(issues, {
            rowNumber,
            columnName: column.headerName,
            code: ISSUE_CODES.invalidResultValue,
            message: `Unsupported ${column.headerName} value: ${rawPupn}.`,
            registrationNo,
            eventLookupKey,
          });
        } else if (column.rowValueRequired) {
          addMissingRequiredResultValueIssue({
            issues,
            rowNumber,
            columnName: column.headerName,
            registrationNo,
            eventLookupKey,
          });
        }
      } else {
        resultItems.push({
          columnName: column.headerName,
          definitionCode: column.definitionCodes[0],
          valueCode: pupnValue,
          valueNumeric: null,
        });
      }

      continue;
    }

    const rawValue = normalizeWorkbookTextCell(
      getCell(row, columnMap, column.headerName),
    );
    if (!rawValue) {
      if (column.rowValueRequired) {
        addMissingRequiredResultValueIssue({
          issues,
          rowNumber,
          columnName: column.headerName,
          registrationNo,
          eventLookupKey,
        });
      }
      continue;
    }

    if (column.parseMode === "VALUE_MAP") {
      const definitionCode = normalizeAllowedValue(
        column.allowedValues,
        rawValue,
      );
      if (!definitionCode) {
        addDefinitionIssue(issues, {
          rowNumber,
          columnName: column.headerName,
          code: ISSUE_CODES.invalidResultValue,
          message: `Unsupported value for ${column.headerName}: ${rawValue}.`,
          registrationNo,
          eventLookupKey,
        });
        continue;
      }

      resultItems.push({
        columnName: column.headerName,
        definitionCode,
        valueCode: null,
        valueNumeric: null,
      });
      continue;
    }

    if (column.parseMode === "FIXED_FLAG") {
      if (
        !isTruthyWorkbookValue(
          getCell(row, columnMap, column.headerName),
          column.headerName,
        )
      ) {
        addDefinitionIssue(issues, {
          rowNumber,
          columnName: column.headerName,
          code: ISSUE_CODES.invalidResultValue,
          message: `Unsupported value for ${column.headerName}: ${rawValue}.`,
          registrationNo,
          eventLookupKey,
        });
        continue;
      }

      resultItems.push({
        columnName: column.headerName,
        definitionCode: column.definitionCodes[0],
        valueCode: null,
        valueNumeric: null,
      });
    }
  }

  return resultItems;
}
