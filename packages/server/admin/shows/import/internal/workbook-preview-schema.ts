import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookTextCell,
} from "./cell";
import {
  DIRECT_DEFINITION_HEADER_ALIASES,
  ISSUE_CODES,
  RESULT_COLUMN_CONFIG,
  STRUCTURAL_FIELD_CONFIG,
} from "./workbook-preview-constants";
import { createIssue } from "./workbook-preview-mappers";
import type {
  WorkbookDefinitionMeta,
  WorkbookLookupData,
  WorkbookResolvedBlockedColumn,
  WorkbookResolvedResultColumn,
  WorkbookResolvedSchema,
  WorkbookStructuralFieldKey,
  WorkbookRow,
} from "./workbook-preview-types";

function buildDefinitionAliasMap(
  definitionsByCode: Map<string, WorkbookDefinitionMeta>,
): Map<string, WorkbookDefinitionMeta> {
  const map = new Map<string, WorkbookDefinitionMeta>();

  for (const definition of definitionsByCode.values()) {
    map.set(normalizeWorkbookComparisonToken(definition.code), definition);
  }

  for (const [aliasToken, code] of Object.entries(
    DIRECT_DEFINITION_HEADER_ALIASES,
  )) {
    const definition = definitionsByCode.get(code);
    if (definition) {
      map.set(aliasToken, definition);
    }
  }

  return map;
}

function isResultColumnSupported(
  valueType: WorkbookDefinitionMeta["valueType"],
): boolean {
  return (
    valueType === "FLAG" || valueType === "CODE" || valueType === "NUMERIC"
  );
}

function resolveSpecialResultColumn(
  headerName: string,
): WorkbookResolvedResultColumn | null {
  const token = normalizeWorkbookComparisonToken(headerName);

  for (const config of RESULT_COLUMN_CONFIG) {
    const matchesAlias = config.aliases.some(
      (alias) => normalizeWorkbookComparisonToken(alias) === token,
    );
    if (!matchesAlias) {
      continue;
    }

    if (config.importMode === "VALUE_MAP") {
      return {
        headerName,
        importMode: "VALUE_MAP",
        definitionCodes: [...config.definitionCodes],
        valueType: "FLAG",
        enabled: true,
        supported: true,
        allowedValues: { ...config.allowedValues },
      };
    }

    if (config.importMode === "NUMERIC") {
      return {
        headerName,
        importMode: "NUMERIC",
        definitionCodes: [config.definitionCodes[0]!],
        valueType: "NUMERIC",
        enabled: true,
        supported: true,
      };
    }

    return {
      headerName,
      importMode: "PUPN",
      definitionCodes: [config.definitionCodes[0]!],
      valueType: "CODE",
      enabled: true,
      supported: true,
    };
  }

  return null;
}

function hasColumnData(rows: WorkbookRow[], columnIndex: number): boolean {
  return rows.some(
    (row) => normalizeWorkbookTextCell(row[columnIndex]) !== null,
  );
}

function buildUnnamedHeaderLabel(columnIndex: number): string {
  return `Unnamed column ${columnIndex + 1}`;
}

function buildUnsupportedColumnReason(headerName: string) {
  return `Workbook column ${headerName} is present but has no import mapping.`;
}

function buildBlockedDefinitionReason(
  headerName: string,
  valueType: WorkbookDefinitionMeta["valueType"],
  enabled: boolean,
) {
  if (!enabled) {
    return {
      reasonCode: "DISABLED_DEFINITION" as const,
      reasonText: `Workbook column ${headerName} matched a disabled definition.`,
    };
  }

  return {
    reasonCode: "UNSUPPORTED_VALUE_TYPE" as const,
    reasonText: `Workbook column ${headerName} matched definition value type ${valueType}, which workbook import does not support.`,
  };
}

export function resolveWorkbookSchema(
  headers: WorkbookRow,
  rows: WorkbookRow[],
  lookupData: Pick<WorkbookLookupData, "definitionsByCode">,
): WorkbookResolvedSchema {
  const structuralFields: WorkbookResolvedSchema["structuralFields"] = {};
  const resultColumns: WorkbookResolvedResultColumn[] = [];
  const blockedColumns: WorkbookResolvedBlockedColumn[] = [];
  const definitionsByToken = buildDefinitionAliasMap(
    lookupData.definitionsByCode,
  );
  const seenHeaders = new Map<
    string,
    { headerName: string; columnIndex: number }
  >();
  const maxColumnCount = Math.max(
    headers.length,
    ...rows.map((row) => row.length),
  );
  let importedColumnCount = 0;
  let totalWorkbookColumns = 0;

  for (let columnIndex = 0; columnIndex < maxColumnCount; columnIndex += 1) {
    const headerName = normalizeWorkbookTextCell(headers[columnIndex]);
    const columnHasData = hasColumnData(rows, columnIndex);

    if (!headerName) {
      if (columnHasData) {
        totalWorkbookColumns += 1;
        blockedColumns.push({
          headerName: buildUnnamedHeaderLabel(columnIndex),
          columnIndex,
          reasonCode: "UNNAMED_COLUMN_WITH_DATA",
          reasonText: `Workbook column ${columnIndex + 1} contains data but the header cell is empty.`,
        });
      }
      continue;
    }

    totalWorkbookColumns += 1;
    const normalizedHeader = normalizeWorkbookComparisonToken(headerName);
    const duplicateHeader = seenHeaders.get(normalizedHeader);
    if (duplicateHeader) {
      blockedColumns.push({
        headerName,
        columnIndex,
        reasonCode: "DUPLICATE_HEADER",
        reasonText: `Workbook header ${headerName} is duplicated (first seen in column ${duplicateHeader.columnIndex + 1}).`,
      });
      continue;
    }
    seenHeaders.set(normalizedHeader, { headerName, columnIndex });

    const structuralConfig = STRUCTURAL_FIELD_CONFIG.find((field) =>
      field.aliases.some(
        (alias) => normalizeWorkbookComparisonToken(alias) === normalizedHeader,
      ),
    );
    if (structuralConfig && !structuralFields[structuralConfig.key]) {
      structuralFields[structuralConfig.key] = {
        key: structuralConfig.key,
        label: structuralConfig.label,
        headerName,
        required: structuralConfig.required,
      };
      importedColumnCount += 1;
      continue;
    }

    const specialResultColumn = resolveSpecialResultColumn(headerName);
    if (specialResultColumn) {
      resultColumns.push(specialResultColumn);
      importedColumnCount += 1;
      continue;
    }

    const definition = definitionsByToken.get(normalizedHeader);
    if (definition) {
      resultColumns.push({
        headerName,
        importMode: "DIRECT",
        definitionCodes: [definition.code],
        valueType: definition.valueType,
        enabled: definition.isEnabled,
        supported: isResultColumnSupported(definition.valueType),
      });

      if (
        definition.isEnabled &&
        isResultColumnSupported(definition.valueType)
      ) {
        importedColumnCount += 1;
      } else {
        const blockedDefinition = buildBlockedDefinitionReason(
          headerName,
          definition.valueType,
          definition.isEnabled,
        );
        blockedColumns.push({
          headerName,
          columnIndex,
          reasonCode: blockedDefinition.reasonCode,
          reasonText: blockedDefinition.reasonText,
        });
      }

      continue;
    }

    blockedColumns.push({
      headerName,
      columnIndex,
      reasonCode: "UNSUPPORTED_COLUMN",
      reasonText: buildUnsupportedColumnReason(headerName),
    });
  }

  const missingRequiredFields = STRUCTURAL_FIELD_CONFIG.flatMap((field) => {
    if (!field.required || structuralFields[field.key]) {
      return [];
    }

    return [
      {
        key: field.key as WorkbookStructuralFieldKey,
        label: field.label,
      },
    ];
  });

  return {
    structuralFields,
    missingRequiredFields,
    resultColumns,
    blockedColumns,
    coverage: {
      totalWorkbookColumns,
      importedColumnCount,
      blockedColumnCount: blockedColumns.length,
    },
  };
}

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

  for (const column of schema.blockedColumns) {
    let code: string = ISSUE_CODES.unsupportedColumn;
    if (column.reasonCode === "DUPLICATE_HEADER") {
      code = ISSUE_CODES.duplicateHeader;
    } else if (column.reasonCode === "UNNAMED_COLUMN_WITH_DATA") {
      code = ISSUE_CODES.unnamedColumnWithData;
    } else if (column.reasonCode === "DISABLED_DEFINITION") {
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
