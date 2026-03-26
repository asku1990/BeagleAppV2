import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import { normalizeWorkbookRegistrationNo } from "./internal/cell";
import { toErrorLog, withLogContext } from "../../../core/logger";
import type { ServiceResult } from "../../../core/result";
import {
  buildColumnMap,
  countIssueSeverity,
  getCell,
  loadLookupData,
  parseWorkbookBuffer,
} from "./internal/workbook-preview-io";
import { buildPreviewEvents } from "./internal/workbook-preview-events";
import {
  buildEventLookupKey,
  createIssue,
} from "./internal/workbook-preview-mappers";
import { parseWorkbookRow } from "./internal/workbook-preview-row";
import {
  buildWorkbookSchemaIssues,
  resolveWorkbookSchema,
} from "./internal/workbook-preview-schema";
import {
  ISSUE_CODES,
  WORKBOOK_FILE_PATTERN,
} from "./internal/workbook-preview-constants";
import type {
  WorkbookParsedRow,
  WorkbookResolvedSchema,
} from "./internal/workbook-preview-types";

function buildSchemaSummary(schema: WorkbookResolvedSchema) {
  return {
    structuralColumns: Object.values(schema.structuralFields)
      .filter((field): field is NonNullable<typeof field> => Boolean(field))
      .map((field) => ({
        fieldKey: field.key,
        expectedHeader: field.label,
        headerName: field.headerName,
        required: field.required,
      })),
    missingStructuralFields: schema.missingRequiredFields.map((field) => ({
      fieldKey: field.key,
      expectedHeader: field.label,
      required: true,
    })),
    definitionColumns: schema.resultColumns.map((column) => ({
      headerName: column.headerName,
      definitionCodes: [...column.definitionCodes],
      importMode: column.importMode,
      valueType: column.valueType,
      enabled: column.enabled,
      supported: column.supported,
    })),
    ignoredColumns: schema.ignoredColumns.map((column) => ({
      headerName: column.headerName,
      columnIndex: column.columnIndex,
      ruleCode: column.ruleCode,
      reasonText: column.reasonText,
    })),
    blockedColumns: schema.blockedColumns.map((column) => ({
      headerName: column.headerName,
      columnIndex: column.columnIndex,
      reasonCode: column.reasonCode,
      reasonText: column.reasonText,
    })),
    coverage: {
      totalWorkbookColumns: schema.coverage.totalWorkbookColumns,
      importedColumnCount: schema.coverage.importedColumnCount,
      ignoredColumnCount: schema.coverage.ignoredColumnCount,
      blockedColumnCount: schema.coverage.blockedColumnCount,
    },
  } satisfies AdminShowWorkbookImportPreviewResponse["schema"];
}

export async function previewAdminShowWorkbookImport(input: {
  fileName: string;
  workbook: Buffer | Uint8Array | ArrayBuffer;
}): Promise<ServiceResult<AdminShowWorkbookImportPreviewResponse>> {
  const log = withLogContext({
    scope: "admin-show-workbook-import-preview",
    fileName: input.fileName,
  });

  if (!WORKBOOK_FILE_PATTERN.test(input.fileName)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Workbook file must use the .xlsx extension.",
        code: ISSUE_CODES.invalidFile,
      },
    };
  }

  try {
    const { sheetName, headers, rows } = parseWorkbookBuffer(input.workbook);
    const columnMap = buildColumnMap(headers);
    const previewIssues: AdminShowWorkbookImportIssue[] = [];

    const lookupData = await loadLookupData();
    if (lookupData.columnRuleCount === 0) {
      return {
        status: 500,
        body: {
          ok: false,
          error: "Show workbook import schema is missing; run the seed first.",
          code: ISSUE_CODES.schemaMissing,
        },
      };
    }

    if (
      lookupData.definitionCount === 0 ||
      lookupData.enabledDefinitionCodes.size === 0
    ) {
      return {
        status: 500,
        body: {
          ok: false,
          error: "Show result definitions are missing; run the seed first.",
          code: ISSUE_CODES.definitionsMissing,
        },
      };
    }

    const schema = resolveWorkbookSchema(headers, rows, lookupData);
    previewIssues.push(...buildWorkbookSchemaIssues(schema));

    if (
      schema.missingRequiredFields.length > 0 ||
      schema.blockedColumns.length > 0
    ) {
      const counts = countIssueSeverity(previewIssues);
      return {
        status: 200,
        body: {
          ok: true,
          data: {
            fileName: input.fileName,
            sheetName,
            rowCount: rows.length,
            acceptedRowCount: 0,
            rejectedRowCount: rows.length,
            eventCount: 0,
            entryCount: 0,
            resultItemCount: 0,
            ...counts,
            schema: buildSchemaSummary(schema),
            issues: previewIssues,
            events: [],
          },
        },
      };
    }

    const previewRows: WorkbookParsedRow[] = [];
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
        previewIssues.push(issue);
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

      if (!parsed.accepted) {
        previewRows.push({
          rowNumber,
          eventLookupKey,
          eventDateIso: parsed.eventDateIso ?? "",
          eventCity: parsed.eventCity ?? "",
          eventPlace: parsed.eventPlace ?? "",
          eventType: parsed.eventType ?? "",
          accepted: false,
          issueCount: parsed.issues.length,
          itemCount: 0,
          registrationNo: parsed.registrationNo ?? "",
          dogName: parsed.dogName ?? "",
          dogMatched: parsed.dogMatched,
          judge: parsed.judge,
          critiqueText: parsed.critiqueText,
          classValue: parsed.classValue ?? "",
          qualityValue: parsed.qualityValue ?? "",
          resultItems: [],
        });
        return;
      }

      if (rowsByEntryKey.has(entryLookupKey)) {
        previewIssues.push(
          createIssue({
            rowNumber,
            columnName: registrationColumn,
            severity: "WARNING",
            code: ISSUE_CODES.duplicateRow,
            message: `Duplicate workbook row for entry ${entryLookupKey}.`,
            registrationNo,
            eventLookupKey,
          }),
        );
        previewRows.push({
          rowNumber,
          eventLookupKey,
          eventDateIso: parsed.eventDateIso ?? "",
          eventCity: parsed.eventCity ?? "",
          eventPlace: parsed.eventPlace ?? "",
          eventType: parsed.eventType ?? "",
          accepted: false,
          issueCount: 1,
          itemCount: 0,
          registrationNo,
          dogName: parsed.dogName ?? "",
          dogMatched: parsed.dogMatched,
          judge: parsed.judge,
          critiqueText: parsed.critiqueText,
          classValue: parsed.classValue ?? "",
          qualityValue: parsed.qualityValue ?? "",
          resultItems: [],
        });
        return;
      }

      rowsByEntryKey.add(entryLookupKey);
      previewRows.push({
        rowNumber,
        eventLookupKey,
        eventDateIso: parsed.eventDateIso ?? "",
        eventCity: parsed.eventCity ?? "",
        eventPlace: parsed.eventPlace ?? "",
        eventType: parsed.eventType ?? "",
        accepted: true,
        issueCount: parsed.issues.length,
        itemCount: parsed.itemCount,
        registrationNo,
        dogName: parsed.dogName ?? "",
        dogMatched: parsed.dogMatched,
        judge: parsed.judge,
        critiqueText: parsed.critiqueText,
        classValue: parsed.classValue ?? "",
        qualityValue: parsed.qualityValue ?? "",
        resultItems: parsed.resultItems,
      });
    });

    const acceptedRowCount = previewRows.filter((row) => row.accepted).length;
    const rejectedRowCount = rows.length - acceptedRowCount;
    const resultItemCount = previewRows
      .filter((row) => row.accepted)
      .reduce((total, row) => total + row.itemCount, 0);
    const events = buildPreviewEvents(previewRows);
    const counts = countIssueSeverity(previewIssues);

    log.info(
      {
        rowCount: rows.length,
        acceptedRowCount,
        rejectedRowCount,
        eventCount: events.length,
        entryCount: previewRows.length,
        resultItemCount,
        ...counts,
      },
      "previewed show workbook import",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          fileName: input.fileName,
          sheetName,
          rowCount: rows.length,
          acceptedRowCount,
          rejectedRowCount,
          eventCount: events.length,
          entryCount: previewRows.length,
          resultItemCount,
          ...counts,
          schema: buildSchemaSummary(schema),
          issues: previewIssues,
          events,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        ...toErrorLog(error),
      },
      "show workbook preview failed",
    );

    return {
      status: 400,
      body: {
        ok: false,
        error: "Workbook preview failed.",
        code: ISSUE_CODES.unreadable,
      },
    };
  }
}
