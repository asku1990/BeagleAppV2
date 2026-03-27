import {
  normalizeWorkbookComparisonToken,
  normalizeWorkbookTextCell,
} from "./cell";
import { ISSUE_CODES } from "./workbook-preview-constants";
import { createIssue } from "./workbook-preview-mappers";
import type {
  WorkbookColumnRuleMeta,
  WorkbookDefinitionMeta,
  WorkbookLookupData,
  WorkbookResolvedBlockedColumn,
  WorkbookResolvedIgnoredColumn,
  WorkbookResolvedResultColumn,
  WorkbookResolvedSchema,
  WorkbookRow,
} from "./workbook-preview-types";

function isResultColumnSupported(
  valueType: WorkbookDefinitionMeta["valueType"],
): boolean {
  return (
    valueType === "FLAG" || valueType === "CODE" || valueType === "NUMERIC"
  );
}

function hasColumnData(rows: WorkbookRow[], columnIndex: number): boolean {
  return rows.some(
    (row) => normalizeWorkbookTextCell(row[columnIndex]) !== null,
  );
}

function buildUnnamedHeaderLabel(columnIndex: number): string {
  return `Unnamed column ${columnIndex + 1}`;
}

function buildIgnoredColumnReason(headerName: string): string {
  return `Workbook column ${headerName} is allowed by import metadata but ignored by policy.`;
}

function buildUnsupportedColumnReason(headerName: string): string {
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

function buildColumnRuleMap(
  rules: WorkbookColumnRuleMeta[],
): Map<string, WorkbookColumnRuleMeta> {
  const map = new Map<string, WorkbookColumnRuleMeta>();

  for (const rule of rules) {
    map.set(normalizeWorkbookComparisonToken(rule.headerName), rule);
  }

  return map;
}

function resolveDefinitionBackedColumn(
  rule: WorkbookColumnRuleMeta,
  definitionsByCode: Map<string, WorkbookDefinitionMeta>,
  blockedColumns: WorkbookResolvedBlockedColumn[],
  columnIndex: number,
): WorkbookResolvedResultColumn | null {
  if (rule.parseMode === "VALUE_MAP") {
    const definitionCodes = rule.valueMaps.map(
      (valueMap) => valueMap.definitionCode,
    );
    for (const definitionCode of definitionCodes) {
      const definition = definitionsByCode.get(definitionCode);
      if (!definition) {
        blockedColumns.push({
          headerName: rule.headerName,
          columnIndex,
          reasonCode: "MISSING_DEFINITION",
          reasonText: `Workbook column ${rule.headerName} references missing definition ${definitionCode}.`,
        });
        return null;
      }

      if (
        !definition.isEnabled ||
        !isResultColumnSupported(definition.valueType)
      ) {
        const blockedDefinition = buildBlockedDefinitionReason(
          rule.headerName,
          definition.valueType,
          definition.isEnabled,
        );
        blockedColumns.push({
          headerName: rule.headerName,
          columnIndex,
          reasonCode: blockedDefinition.reasonCode,
          reasonText: blockedDefinition.reasonText,
        });
        return null;
      }
    }

    return {
      ruleCode: rule.code,
      headerName: rule.headerName,
      rowValueRequired: rule.rowValueRequired,
      importMode: "VALUE_MAP",
      parseMode: "VALUE_MAP",
      definitionCodes,
      valueType: "FLAG",
      allowedValues: Object.fromEntries(
        rule.valueMaps.map((valueMap) => [
          valueMap.workbookValue,
          valueMap.definitionCode,
        ]),
      ),
    };
  }

  if (!rule.fixedDefinitionCode) {
    blockedColumns.push({
      headerName: rule.headerName,
      columnIndex,
      reasonCode: "MISSING_DEFINITION",
      reasonText: `Workbook column ${rule.headerName} does not define a target definition code.`,
    });
    return null;
  }

  const definition = definitionsByCode.get(rule.fixedDefinitionCode);
  if (!definition) {
    blockedColumns.push({
      headerName: rule.headerName,
      columnIndex,
      reasonCode: "MISSING_DEFINITION",
      reasonText: `Workbook column ${rule.headerName} references missing definition ${rule.fixedDefinitionCode}.`,
    });
    return null;
  }

  if (!definition.isEnabled || !isResultColumnSupported(definition.valueType)) {
    const blockedDefinition = buildBlockedDefinitionReason(
      rule.headerName,
      definition.valueType,
      definition.isEnabled,
    );
    blockedColumns.push({
      headerName: rule.headerName,
      columnIndex,
      reasonCode: blockedDefinition.reasonCode,
      reasonText: blockedDefinition.reasonText,
    });
    return null;
  }

  if (rule.parseMode === "FIXED_NUMERIC") {
    return {
      ruleCode: rule.code,
      headerName: rule.headerName,
      rowValueRequired: rule.rowValueRequired,
      importMode: "NUMERIC",
      parseMode: "FIXED_NUMERIC",
      definitionCodes: [rule.fixedDefinitionCode],
      valueType: "NUMERIC",
    };
  }

  if (rule.parseMode === "FIXED_CODE") {
    return {
      ruleCode: rule.code,
      headerName: rule.headerName,
      rowValueRequired: rule.rowValueRequired,
      importMode: "PUPN",
      parseMode: "FIXED_CODE",
      definitionCodes: [rule.fixedDefinitionCode],
      valueType: "CODE",
    };
  }

  if (rule.parseMode === "FIXED_FLAG") {
    return {
      ruleCode: rule.code,
      headerName: rule.headerName,
      rowValueRequired: rule.rowValueRequired,
      importMode: "DIRECT",
      parseMode: "FIXED_FLAG",
      definitionCodes: [rule.fixedDefinitionCode],
      valueType: "FLAG",
      allowedDefinitionCategoryCode: null,
    };
  }

  if (rule.parseMode === "DEFINITION_FROM_CELL") {
    return {
      ruleCode: rule.code,
      headerName: rule.headerName,
      rowValueRequired: rule.rowValueRequired,
      importMode: "DIRECT",
      parseMode: "DEFINITION_FROM_CELL",
      definitionCodes: [],
      valueType: "CODE",
      allowedDefinitionCategoryCode: rule.allowedDefinitionCategoryCode,
    };
  }

  blockedColumns.push({
    headerName: rule.headerName,
    columnIndex,
    reasonCode: "UNSUPPORTED_COLUMN",
    reasonText: buildUnsupportedColumnReason(rule.headerName),
  });
  return null;
}

export function resolveWorkbookSchema(
  headers: WorkbookRow,
  rows: WorkbookRow[],
  lookupData: Pick<WorkbookLookupData, "definitionsByCode" | "columnRules">,
): WorkbookResolvedSchema {
  const structuralFields: WorkbookResolvedSchema["structuralFields"] = {};
  const resultColumns: WorkbookResolvedResultColumn[] = [];
  const ignoredColumns: WorkbookResolvedIgnoredColumn[] = [];
  const blockedColumns: WorkbookResolvedBlockedColumn[] = [];
  const ruleMap = buildColumnRuleMap(lookupData.columnRules);
  const matchedRuleCodes = new Set<string>();
  const seenHeaders = new Map<
    string,
    { headerName: string; columnIndex: number }
  >();
  const maxColumnCount = Math.max(
    headers.length,
    ...rows.map((row) => row.length),
  );
  let importedColumnCount = 0;
  let ignoredColumnCount = 0;
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

    const rule = ruleMap.get(normalizedHeader);
    if (!rule) {
      blockedColumns.push({
        headerName,
        columnIndex,
        reasonCode: "UNSUPPORTED_COLUMN",
        reasonText: buildUnsupportedColumnReason(headerName),
      });
      continue;
    }

    if (rule.policy === "IGNORE") {
      ignoredColumns.push({
        headerName,
        columnIndex,
        ruleCode: rule.code,
        reasonText: buildIgnoredColumnReason(headerName),
      });
      ignoredColumnCount += 1;
      continue;
    }

    if (rule.targetField) {
      if (!structuralFields[rule.targetField]) {
        structuralFields[rule.targetField] = {
          key: rule.targetField,
          label: rule.headerName,
          headerName,
          required: rule.headerRequired,
          rowValueRequired: rule.rowValueRequired,
          destinationKind: rule.destinationKind ?? "SHOW_ENTRY",
          parseMode: rule.parseMode,
          allowedDefinitionCategoryCode: rule.allowedDefinitionCategoryCode,
        };
      }
      matchedRuleCodes.add(rule.code);
      importedColumnCount += 1;
      continue;
    }

    if (rule.destinationKind === "SHOW_RESULT_ITEM") {
      const resolvedColumn = resolveDefinitionBackedColumn(
        rule,
        lookupData.definitionsByCode,
        blockedColumns,
        columnIndex,
      );
      if (resolvedColumn) {
        resultColumns.push(resolvedColumn);
        matchedRuleCodes.add(rule.code);
        importedColumnCount += 1;
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

  const requiredRules = lookupData.columnRules.filter(
    (rule) => rule.policy === "IMPORT" && rule.headerRequired,
  );

  const missingRequiredFields = requiredRules.flatMap((rule) => {
    if (matchedRuleCodes.has(rule.code)) {
      return [];
    }

    return [
      {
        key: rule.targetField ?? rule.code,
        label: rule.headerName,
      },
    ];
  });

  return {
    structuralFields,
    missingRequiredFields,
    resultColumns,
    ignoredColumns,
    blockedColumns,
    coverage: {
      totalWorkbookColumns,
      importedColumnCount,
      ignoredColumnCount,
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
