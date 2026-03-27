import type { AdminShowWorkbookImportApplyResponse } from "@beagle/contracts";
import { writeAdminShowWorkbookImportDb } from "@beagle/db";
import { toErrorLog, withLogContext } from "../../../core/logger";
import type { ServiceResult } from "../../../core/result";
import {
  ISSUE_CODES,
  WORKBOOK_FILE_PATTERN,
} from "./internal/workbook-preview-constants";
import { evaluateWorkbookImport } from "./internal/workbook-import-runtime";

export async function applyAdminShowWorkbookImport(input: {
  fileName: string;
  workbook: Buffer | Uint8Array | ArrayBuffer;
}): Promise<ServiceResult<AdminShowWorkbookImportApplyResponse>> {
  const log = withLogContext({
    scope: "admin-show-workbook-import-apply",
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
      return {
        status: runtime.status,
        body: {
          ok: false,
          error: runtime.error,
          code: runtime.code,
        },
      };
    }

    if (runtime.errorCount > 0) {
      return {
        status: 200,
        body: {
          ok: true,
          data: {
            success: false,
            eventsCreated: 0,
            entriesCreated: 0,
            itemsCreated: 0,
            infoCount: runtime.infoCount,
            warningCount: runtime.warningCount,
            errorCount: runtime.errorCount,
            issues: runtime.issues,
          },
        },
      };
    }

    const acceptedRows = runtime.rows.filter((row) => row.accepted);
    const writeResult = await writeAdminShowWorkbookImportDb({
      fileName: input.fileName,
      rows: acceptedRows.map((row) => ({
        rowNumber: row.rowNumber,
        eventLookupKey: row.eventLookupKey,
        eventDateIso: row.eventDateIso,
        eventCity: row.eventCity,
        eventPlace: row.eventPlace,
        eventType: row.eventType,
        registrationNo: row.registrationNo,
        dogName: row.dogName,
        judge: row.judge,
        critiqueText: row.critiqueText,
        resultItems: row.resultItems,
      })),
    });

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          success: true,
          eventsCreated: writeResult.eventsCreated,
          entriesCreated: writeResult.entriesCreated,
          itemsCreated: writeResult.itemsCreated,
          infoCount: runtime.infoCount,
          warningCount: runtime.warningCount,
          errorCount: runtime.errorCount,
          issues: runtime.issues,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        ...toErrorLog(error),
      },
      "show workbook apply failed",
    );
    return {
      status: 409,
      body: {
        ok: false,
        error:
          "Workbook import write failed. Retry import preview and try again.",
        code: ISSUE_CODES.importWriteFailed,
      },
    };
  }
}
