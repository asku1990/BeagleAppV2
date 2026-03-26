import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookInteger,
  normalizeWorkbookTextCell,
} from "./cell";
import {
  ISSUE_CODES,
  STRUCTURAL_FIELD_ALLOWED_VALUE_MAP,
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
}: BuildWorkbookPreviewItemsInput) {
  const resultItems = [];

  const classCode = normalizeAllowedValue(
    STRUCTURAL_FIELD_ALLOWED_VALUE_MAP.classValue,
    classValue,
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

  const qualityCode = normalizeAllowedValue(
    STRUCTURAL_FIELD_ALLOWED_VALUE_MAP.qualityValue,
    qualityValue,
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
    if (!column.enabled || !column.supported) {
      continue;
    }

    if (column.importMode === "NUMERIC") {
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

    if (column.importMode === "PUPN") {
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
      continue;
    }

    if (column.importMode === "VALUE_MAP") {
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

    const definitionCode = column.definitionCodes[0];
    if (column.valueType === "FLAG") {
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
        definitionCode,
        valueCode: null,
        valueNumeric: null,
      });
      continue;
    }

    if (column.valueType === "CODE") {
      resultItems.push({
        columnName: column.headerName,
        definitionCode,
        valueCode: rawValue,
        valueNumeric: null,
      });
      continue;
    }

    const numericValue = normalizeWorkbookInteger(
      getCell(row, columnMap, column.headerName),
    );
    if (numericValue === "INVALID") {
      addDefinitionIssue(issues, {
        rowNumber,
        columnName: column.headerName,
        code: ISSUE_CODES.invalidResultValue,
        message: `${column.headerName} must be a non-negative integer.`,
        registrationNo,
        eventLookupKey,
      });
      continue;
    }

    if (numericValue !== null) {
      resultItems.push({
        columnName: column.headerName,
        definitionCode,
        valueCode: null,
        valueNumeric: numericValue,
      });
    }
  }

  return resultItems;
}
