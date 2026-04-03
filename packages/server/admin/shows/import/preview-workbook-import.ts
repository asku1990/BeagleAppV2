import type { AdminShowWorkbookImportPreviewResponse } from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import {
  ISSUE_CODES,
  WORKBOOK_FILE_PATTERN,
} from "./internal/workbook-preview-constants";
import { buildWorkbookIssueLogSummary } from "./internal/workbook-import-log-summary";
import type { WorkbookResolvedSchema } from "./internal/workbook-preview-types";
import { evaluateWorkbookImport } from "./internal/runtime/evaluate-workbook-import";

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
    const runtime = await evaluateWorkbookImport({
      workbook: input.workbook,
      runDuplicateChecks: true,
    });
    if (!runtime.ok) {
      const logMethod =
        runtime.status >= 500 ? log.error.bind(log) : log.warn.bind(log);
      logMethod(
        {
          status: runtime.status,
          code: runtime.code,
          errorMessage: runtime.error,
        },
        "show workbook preview failed",
      );
      return {
        status: runtime.status,
        body: {
          ok: false,
          error: runtime.error,
          code: runtime.code,
        },
      };
    }

    log.info(
      {
        rowCount: runtime.rowCount,
        acceptedRowCount: runtime.acceptedRowCount,
        rejectedRowCount: runtime.rejectedRowCount,
        eventCount: runtime.eventCount,
        entryCount: runtime.entryCount,
        resultItemCount: runtime.resultItemCount,
        infoCount: runtime.infoCount,
        warningCount: runtime.warningCount,
        errorCount: runtime.errorCount,
      },
      "previewed show workbook import",
    );
    if (runtime.warningCount > 0 || runtime.errorCount > 0) {
      log.warn(
        {
          rowCount: runtime.rowCount,
          acceptedRowCount: runtime.acceptedRowCount,
          rejectedRowCount: runtime.rejectedRowCount,
          eventCount: runtime.eventCount,
          entryCount: runtime.entryCount,
          resultItemCount: runtime.resultItemCount,
          infoCount: runtime.infoCount,
          warningCount: runtime.warningCount,
          errorCount: runtime.errorCount,
          ...buildWorkbookIssueLogSummary(runtime.issues),
        },
        "show workbook preview completed with issues",
      );
    }

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          fileName: input.fileName,
          sheetName: runtime.sheetName,
          rowCount: runtime.rowCount,
          acceptedRowCount: runtime.acceptedRowCount,
          rejectedRowCount: runtime.rejectedRowCount,
          eventCount: runtime.eventCount,
          entryCount: runtime.entryCount,
          resultItemCount: runtime.resultItemCount,
          infoCount: runtime.infoCount,
          warningCount: runtime.warningCount,
          errorCount: runtime.errorCount,
          schema: buildSchemaSummary(runtime.schema),
          issues: runtime.issues,
          events: runtime.events,
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
