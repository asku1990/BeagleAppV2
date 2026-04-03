import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import { normalizeWorkbookComparisonToken } from "../cell";
import { checkExistingImportConflicts } from "../duplicates/check-existing-import-conflicts";
import { buildColumnMap } from "../input/build-column-map";
import { loadWorkbookLookupData } from "../input/load-workbook-lookup-data";
import { parseWorkbookBuffer } from "../input/parse-workbook-buffer";
import { createIssue } from "../workbook-preview-mappers";
import { evaluateWorkbookRow } from "../rows/evaluate-workbook-row";
import { buildWorkbookSchemaIssues } from "../schema/build-workbook-schema-issues";
import { resolveWorkbookSchema } from "../schema/resolve-workbook-schema";
import { ISSUE_CODES } from "../workbook-preview-constants";
import { normalizeWorkbookRegistrationNo } from "../cell";
import { mapWorkbookStructuralFieldKeyToTargetField } from "../workbook-preview-target-fields";
import type {
  WorkbookColumnRuleMeta,
  WorkbookParsedRow,
} from "../workbook-preview-types";
import {
  summarizeWorkbookImport,
  type WorkbookImportRuntimeSuccess,
} from "./summarize-workbook-import";
import { validateAdminShowWorkbookSchemaRules } from "@server/admin/shows/core/workbook-schema-validation";
import { buildPreviewRow } from "./build-preview-row";
import { rejectParsedRow } from "./reject-parsed-row";

// Shared workbook evaluation pipeline for preview/apply: parse, validate, de-duplicate, then summarize.
type WorkbookImportRuntimeFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

function toWorkbookSchemaValidationRule(rule: WorkbookColumnRuleMeta) {
  return {
    code: rule.code,
    headerName: rule.headerName,
    policy: rule.policy,
    destinationKind: rule.destinationKind,
    targetField: mapWorkbookStructuralFieldKeyToTargetField(rule.targetField),
    parseMode: rule.parseMode,
    fixedDefinitionCode: rule.fixedDefinitionCode,
    allowedDefinitionCategoryCode: rule.allowedDefinitionCategoryCode,
    headerRequired: rule.headerRequired,
    rowValueRequired: rule.rowValueRequired,
    sortOrder: rule.sortOrder,
    isEnabled: rule.isEnabled,
    valueMaps: rule.valueMaps.map((valueMap) => ({
      workbookValue: valueMap.workbookValue,
      definitionCode: valueMap.definitionCode,
      sortOrder: valueMap.sortOrder,
    })),
  };
}

function buildDuplicateWorkbookRowIssue(input: {
  rowNumber: number;
  registrationNo: string;
  eventLookupKey: string;
}) {
  return createIssue({
    rowNumber: input.rowNumber,
    columnName: "Rekisterinumero",
    severity: "ERROR",
    code: ISSUE_CODES.duplicateRow,
    message: `Duplicate workbook row for ${input.registrationNo} in event ${input.eventLookupKey}.`,
    registrationNo: input.registrationNo,
    eventLookupKey: input.eventLookupKey,
  });
}

export type WorkbookImportRuntimeResult =
  | WorkbookImportRuntimeSuccess
  | WorkbookImportRuntimeFailure;

export async function evaluateWorkbookImport(input: {
  workbook: Buffer | Uint8Array | ArrayBuffer;
  runDuplicateChecks: boolean;
}): Promise<WorkbookImportRuntimeResult> {
  const { sheetName, headers, rows, date1904 } = parseWorkbookBuffer(
    input.workbook,
  );
  const columnMap = buildColumnMap(headers);
  const issues: AdminShowWorkbookImportIssue[] = [];
  const registrationColumnIndex = columnMap.get(
    normalizeWorkbookComparisonToken("Rekisterinumero"),
  );
  const workbookRegistrationNos =
    registrationColumnIndex === undefined
      ? undefined
      : [
          ...new Set(
            rows
              .map((row) =>
                normalizeWorkbookRegistrationNo(row[registrationColumnIndex]),
              )
              .filter((value): value is string => Boolean(value)),
          ),
        ];
  const lookupData = await loadWorkbookLookupData({
    registrationNos: workbookRegistrationNos,
  });

  if (lookupData.columnRuleCount === 0) {
    return {
      ok: false,
      status: 500,
      code: ISSUE_CODES.schemaMissing,
      error: "Show workbook import schema is missing; run the seed first.",
    };
  }

  if (
    lookupData.definitionCount === 0 ||
    lookupData.enabledDefinitionCodes.size === 0
  ) {
    return {
      ok: false,
      status: 500,
      code: ISSUE_CODES.definitionsMissing,
      error: "Show result definitions are missing; run the seed first.",
    };
  }

  const metadataErrors = validateAdminShowWorkbookSchemaRules(
    lookupData.columnRules.map(toWorkbookSchemaValidationRule),
    {
      definitions: [...lookupData.definitionsByCode.values()],
      categories: lookupData.definitionCategories,
    },
  );
  if (metadataErrors.length > 0) {
    return {
      ok: false,
      status: 500,
      code: ISSUE_CODES.schemaInvalid,
      error:
        metadataErrors[0]?.message ?? "Show workbook import schema is invalid.",
    };
  }

  const schema = resolveWorkbookSchema(headers, rows, lookupData);
  issues.push(...buildWorkbookSchemaIssues(schema));

  const parsedRows: WorkbookParsedRow[] = [];
  const rowsByEntryKey = new Set<string>();
  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const parsed = evaluateWorkbookRow(row, columnMap, rowNumber, {
      dogIdByRegistration: lookupData.dogIdByRegistration,
      enabledDefinitionCodes: lookupData.enabledDefinitionCodes,
      definitionsByCode: lookupData.definitionsByCode,
      schema,
      date1904,
    });

    for (const issue of parsed.issues) {
      issues.push(issue);
    }

    const { previewRow, entryLookupKey } = buildPreviewRow({
      parsed,
      row,
      rowNumber,
      columnMap,
      schema,
    });

    if (!parsed.accepted) {
      parsedRows.push(previewRow);
      return;
    }

    if (rowsByEntryKey.has(entryLookupKey)) {
      rejectParsedRow(previewRow);
      issues.push(
        buildDuplicateWorkbookRowIssue({
          rowNumber,
          registrationNo: previewRow.registrationNo,
          eventLookupKey: previewRow.eventLookupKey,
        }),
      );
    } else {
      rowsByEntryKey.add(entryLookupKey);
    }

    parsedRows.push(previewRow);
  });

  if (
    input.runDuplicateChecks &&
    schema.missingRequiredFields.length === 0 &&
    schema.blockedColumns.length === 0
  ) {
    await checkExistingImportConflicts({ rows: parsedRows, issues });
  }

  const hasBlockingSchemaIssues =
    schema.missingRequiredFields.length > 0 || schema.blockedColumns.length > 0;
  if (hasBlockingSchemaIssues) {
    for (const row of parsedRows) {
      row.accepted = false;
      row.itemCount = 0;
      row.resultItems = [];
    }
  }

  return summarizeWorkbookImport({
    sheetName,
    rows: parsedRows,
    issues,
    schema,
  });
}
