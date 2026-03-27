import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookInteger,
  normalizeWorkbookTextCell,
} from "./cell";
import {
  ISSUE_CODES,
  TRUTHY_WORKBOOK_TOKENS,
} from "./workbook-preview-constants";
import {
  addDefinitionIssue,
  normalizeAllowedValue,
  parsePupnValue,
} from "./workbook-preview-mappers";
import { getCell } from "./workbook-preview-io";
import type {
  WorkbookColumnMap,
  WorkbookDefinitionMeta,
  WorkbookResolvedSchema,
  WorkbookRow,
} from "./workbook-preview-types";

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

export function buildWorkbookPreviewItems({
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

  const classCode = resolveDefinitionCodeFromWorkbookValue(
    definitionsByCode,
    classValue,
    schema.structuralFields.classValue?.allowedDefinitionCategoryCode ?? null,
  );
  if (!classCode) {
    addDefinitionIssue(issues, {
      rowNumber,
      columnName: schema.structuralFields.classValue?.headerName ?? "Luokka",
      code: ISSUE_CODES.invalidResultValue,
      message: `Unsupported class value: ${classValue}.`,
      registrationNo,
      eventLookupKey,
    });
  } else {
    resultItems.push({
      columnName: schema.structuralFields.classValue?.headerName ?? "Luokka",
      definitionCode: classCode,
      valueCode: null,
      valueNumeric: null,
    });
  }

  const qualityCode = resolveDefinitionCodeFromWorkbookValue(
    definitionsByCode,
    qualityValue,
    schema.structuralFields.qualityValue?.allowedDefinitionCategoryCode ?? null,
  );
  if (!qualityCode) {
    addDefinitionIssue(issues, {
      rowNumber,
      columnName:
        schema.structuralFields.qualityValue?.headerName ?? "Laatuarvostelu",
      code: ISSUE_CODES.invalidResultValue,
      message: `Unsupported quality value: ${qualityValue}.`,
      registrationNo,
      eventLookupKey,
    });
  } else {
    resultItems.push({
      columnName:
        schema.structuralFields.qualityValue?.headerName ?? "Laatuarvostelu",
      definitionCode: qualityCode,
      valueCode: null,
      valueNumeric: null,
    });
  }

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
