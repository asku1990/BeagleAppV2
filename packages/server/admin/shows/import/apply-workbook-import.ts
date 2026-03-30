import type { AdminShowWorkbookImportApplyResponse } from "@beagle/contracts";
import {
  WORKBOOK_IMPORT_WRITE_TX_CONFIG,
  writeAdminShowWorkbookImportDb,
} from "@beagle/db";
import { toErrorLog, withLogContext } from "../../../core/logger";
import type { ServiceResult } from "../../../core/result";
import {
  ISSUE_CODES,
  WORKBOOK_FILE_PATTERN,
} from "./internal/workbook-preview-constants";
import { evaluateWorkbookImport } from "./internal/runtime/evaluate-workbook-import";

type PrismaLikeError = {
  code?: unknown;
  message?: unknown;
};

function isPrismaTransactionTimeoutError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const prismaLikeError = error as PrismaLikeError;

  const code =
    "code" in error && typeof prismaLikeError.code === "string"
      ? prismaLikeError.code
      : null;
  const message =
    "message" in error && typeof prismaLikeError.message === "string"
      ? prismaLikeError.message.toLowerCase()
      : "";

  const matchesTimeoutMessage =
    /transaction.*expired/i.test(message) ||
    /unable to start a transaction in the given time/i.test(message);

  if (code === "P2028") {
    return matchesTimeoutMessage;
  }

  return matchesTimeoutMessage;
}

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

  let runtime;
  try {
    runtime = await evaluateWorkbookImport({
      workbook: input.workbook,
      runDuplicateChecks: true,
    });
  } catch (error) {
    log.error(
      {
        ...toErrorLog(error),
      },
      "show workbook apply parse failed",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Workbook apply failed.",
        code: ISSUE_CODES.unreadable,
      },
    };
  }

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

  try {
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
    const isTimeout = isPrismaTransactionTimeoutError(error);
    log.error(
      {
        ...toErrorLog(error),
        acceptedRowCount: runtime.acceptedRowCount,
        eventCount: runtime.eventCount,
        entryCount: runtime.entryCount,
        resultItemCount: runtime.resultItemCount,
        transactionMaxWaitMs: WORKBOOK_IMPORT_WRITE_TX_CONFIG.maxWait,
        transactionTimeoutMs: WORKBOOK_IMPORT_WRITE_TX_CONFIG.timeout,
        isTransactionTimeout: isTimeout,
      },
      "show workbook apply write failed",
    );
    return {
      status: 409,
      body: {
        ok: false,
        error: isTimeout
          ? "Workbook import timed out before commit. No rows were written. Retry import preview and try again."
          : "Workbook import write failed. Retry import preview and try again.",
        code: isTimeout
          ? ISSUE_CODES.importTimeout
          : ISSUE_CODES.importWriteFailed,
      },
    };
  }
}
