import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import { listExistingShowImportKeysDb } from "@beagle/db";
import { normalizeWorkbookComparisonToken } from "./cell";
import {
  buildColumnMap,
  countIssueSeverity,
  getCell,
  loadLookupData,
  parseWorkbookBuffer,
} from "./workbook-preview-io";
import { buildPreviewEvents } from "./workbook-preview-events";
import { buildEventLookupKey, createIssue } from "./workbook-preview-mappers";
import { parseWorkbookRow } from "./workbook-preview-row";
import {
  buildWorkbookSchemaIssues,
  resolveWorkbookSchema,
} from "./workbook-preview-schema";
import { ISSUE_CODES } from "./workbook-preview-constants";
import { normalizeWorkbookRegistrationNo } from "./cell";
import { mapWorkbookStructuralFieldKeyToTargetField } from "./workbook-preview-target-fields";
import type {
  WorkbookParsedRow,
  WorkbookResolvedSchema,
} from "./workbook-preview-types";
import { validateAdminShowWorkbookSchemaRules } from "../../core/workbook-schema-validation";

// Shared workbook evaluation pipeline for preview/apply: parse, validate, and DB duplicate checks.
type WorkbookImportRuntimeSuccess = {
  ok: true;
  sheetName: string;
  rows: WorkbookParsedRow[];
  issues: AdminShowWorkbookImportIssue[];
  schema: WorkbookResolvedSchema;
  rowCount: number;
  acceptedRowCount: number;
  rejectedRowCount: number;
  eventCount: number;
  entryCount: number;
  resultItemCount: number;
  infoCount: number;
  warningCount: number;
  errorCount: number;
  events: ReturnType<typeof buildPreviewEvents>;
};

type WorkbookImportRuntimeFailure = {
  ok: false;
  status: number;
  code: string;
  error: string;
};

export type WorkbookImportRuntimeResult =
  | WorkbookImportRuntimeSuccess
  | WorkbookImportRuntimeFailure;

function valuesConflict(left: string, right: string): boolean {
  return (
    normalizeWorkbookComparisonToken(left) !==
    normalizeWorkbookComparisonToken(right)
  );
}

function addEntryAlreadyExistsIssue(input: {
  issues: AdminShowWorkbookImportIssue[];
  row: WorkbookParsedRow;
}) {
  input.issues.push(
    createIssue({
      rowNumber: input.row.rowNumber,
      columnName: "Rekisterinumero",
      severity: "ERROR",
      code: ISSUE_CODES.duplicateExistingEntry,
      message: `Entry already exists for ${input.row.registrationNo} in event ${input.row.eventLookupKey}.`,
      registrationNo: input.row.registrationNo,
      eventLookupKey: input.row.eventLookupKey,
    }),
  );
}

function addEventConflictIssue(input: {
  issues: AdminShowWorkbookImportIssue[];
  row: WorkbookParsedRow;
  existingCity: string | null;
  existingType: string | null;
}) {
  const details: string[] = [];
  if (
    input.existingCity &&
    input.row.eventCity &&
    valuesConflict(input.existingCity, input.row.eventCity)
  ) {
    details.push(
      `city differs (workbook "${input.row.eventCity}", existing "${input.existingCity}")`,
    );
  }
  if (
    input.existingType &&
    input.row.eventType &&
    valuesConflict(input.existingType, input.row.eventType)
  ) {
    details.push(
      `type differs (workbook "${input.row.eventType}", existing "${input.existingType}")`,
    );
  }

  input.issues.push(
    createIssue({
      rowNumber: input.row.rowNumber,
      columnName: null,
      severity: "ERROR",
      code: ISSUE_CODES.eventMetadataConflict,
      message: `Event metadata conflicts with existing data for ${input.row.eventLookupKey}: ${details.join(", ")}.`,
      registrationNo: input.row.registrationNo,
      eventLookupKey: input.row.eventLookupKey,
    }),
  );
}

function hasEventMetadataConflict(
  row: WorkbookParsedRow,
  event: { eventCity: string | null; eventType: string | null },
): boolean {
  if (
    event.eventCity &&
    row.eventCity &&
    valuesConflict(event.eventCity, row.eventCity)
  ) {
    return true;
  }
  if (
    event.eventType &&
    row.eventType &&
    valuesConflict(event.eventType, row.eventType)
  ) {
    return true;
  }
  return false;
}

async function applyDuplicateChecks(input: {
  rows: WorkbookParsedRow[];
  issues: AdminShowWorkbookImportIssue[];
}) {
  const acceptedRows = input.rows.filter((row) => row.accepted);
  if (acceptedRows.length === 0) {
    return;
  }

  const eventKeys = [...new Set(acceptedRows.map((row) => row.eventLookupKey))];
  const entryKeys = [
    ...new Set(
      acceptedRows.map((row) => `${row.registrationNo}|${row.eventLookupKey}`),
    ),
  ];
  const { events: existingEvents, entries: existingEntries } =
    await listExistingShowImportKeysDb({
      eventLookupKeys: eventKeys,
      entryLookupKeys: entryKeys,
    });

  const existingEventsByKey = new Map(
    existingEvents.map((event) => [event.eventLookupKey, event]),
  );
  const existingEntryKeys = new Set(
    existingEntries.map((entry) => entry.entryLookupKey),
  );
  for (const row of input.rows) {
    if (!row.accepted) {
      continue;
    }

    const entryLookupKey = `${row.registrationNo}|${row.eventLookupKey}`;
    if (existingEntryKeys.has(entryLookupKey)) {
      row.accepted = false;
      row.issueCount += 1;
      row.itemCount = 0;
      row.resultItems = [];
      addEntryAlreadyExistsIssue({ issues: input.issues, row });
      continue;
    }

    const existingEvent = existingEventsByKey.get(row.eventLookupKey);
    if (!existingEvent || !hasEventMetadataConflict(row, existingEvent)) {
      continue;
    }

    row.accepted = false;
    row.issueCount += 1;
    row.itemCount = 0;
    row.resultItems = [];
    addEventConflictIssue({
      issues: input.issues,
      row,
      existingCity: existingEvent.eventCity,
      existingType: existingEvent.eventType,
    });
  }
}

export async function evaluateWorkbookImport(input: {
  workbook: Buffer | Uint8Array | ArrayBuffer;
  runDuplicateChecks: boolean;
}): Promise<WorkbookImportRuntimeResult> {
  const { sheetName, headers, rows } = parseWorkbookBuffer(input.workbook);
  const columnMap = buildColumnMap(headers);
  const issues: AdminShowWorkbookImportIssue[] = [];
  const lookupData = await loadLookupData();

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
    lookupData.columnRules.map((rule) => ({
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
    })),
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
    const parsed = parseWorkbookRow(row, columnMap, rowNumber, {
      dogIdByRegistration: lookupData.dogIdByRegistration,
      enabledDefinitionCodes: lookupData.enabledDefinitionCodes,
      definitionsByCode: lookupData.definitionsByCode,
      schema,
    });

    for (const issue of parsed.issues) {
      issues.push(issue);
    }

    const derivedEventLookupKey =
      parsed.eventDateIso &&
      parsed.eventCity &&
      parsed.eventPlace &&
      parsed.eventType
        ? buildEventLookupKey({
            eventDateIso: parsed.eventDateIso,
            eventCity: parsed.eventCity,
            eventPlace: parsed.eventPlace,
            eventType: parsed.eventType,
          })
        : null;
    const eventLookupKey =
      parsed.eventLookupKey ?? derivedEventLookupKey ?? `row-${rowNumber}`;
    const registrationColumn =
      schema.structuralFields.registrationNo?.headerName ?? "Rekisterinumero";
    const registrationNo =
      parsed.registrationNo ??
      normalizeWorkbookRegistrationNo(
        getCell(row, columnMap, registrationColumn),
      ) ??
      "";
    const entryLookupKey = `${registrationNo}|${eventLookupKey}`;

    const previewRow: WorkbookParsedRow = {
      rowNumber,
      eventLookupKey,
      eventDateIso: parsed.eventDateIso ?? "",
      eventCity: parsed.eventCity ?? "",
      eventPlace: parsed.eventPlace ?? "",
      eventType: parsed.eventType ?? "",
      accepted: parsed.accepted,
      issueCount: parsed.issues.length,
      itemCount: parsed.accepted ? parsed.itemCount : 0,
      registrationNo: parsed.registrationNo ?? "",
      dogName: parsed.dogName ?? "",
      dogMatched: parsed.dogMatched,
      judge: parsed.judge,
      critiqueText: parsed.critiqueText,
      classValue: parsed.classValue ?? "",
      qualityValue: parsed.qualityValue ?? "",
      resultItems: parsed.accepted ? parsed.resultItems : [],
    };

    if (!parsed.accepted) {
      parsedRows.push(previewRow);
      return;
    }

    if (rowsByEntryKey.has(entryLookupKey)) {
      previewRow.accepted = false;
      previewRow.issueCount += 1;
      previewRow.itemCount = 0;
      previewRow.resultItems = [];
      issues.push(
        createIssue({
          rowNumber,
          columnName: "Rekisterinumero",
          severity: "ERROR",
          code: ISSUE_CODES.duplicateRow,
          message: `Duplicate workbook row for ${registrationNo} in event ${eventLookupKey}.`,
          registrationNo,
          eventLookupKey,
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
    await applyDuplicateChecks({ rows: parsedRows, issues });
  }

  const counts = countIssueSeverity(issues);
  const acceptedRows = parsedRows.filter((row) => row.accepted);
  const rejectedRows = parsedRows.length - acceptedRows.length;

  return {
    ok: true,
    sheetName,
    rows: parsedRows,
    issues,
    schema,
    rowCount: rows.length,
    acceptedRowCount: acceptedRows.length,
    rejectedRowCount: rejectedRows,
    eventCount: new Set(acceptedRows.map((row) => row.eventLookupKey)).size,
    entryCount: acceptedRows.length,
    resultItemCount: acceptedRows.reduce((sum, row) => sum + row.itemCount, 0),
    infoCount: counts.infoCount,
    warningCount: counts.warningCount,
    errorCount: counts.errorCount,
    events: buildPreviewEvents(parsedRows),
  };
}
