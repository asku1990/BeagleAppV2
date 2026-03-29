"use server";

import type {
  ActionResult,
  AdminShowWorkbookImportApplyResponse,
} from "@beagle/contracts";
import { applyAdminShowWorkbookImport } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { readWorkbookActionFile } from "./workbook-file";

export async function applyAdminShowWorkbookImportAction(
  formData: FormData,
): Promise<ActionResult<AdminShowWorkbookImportApplyResponse>> {
  const adminAccess = await requireAdminLayoutAccess();
  if (!adminAccess.ok) {
    return {
      ok: false,
      error: {
        code: adminAccess.status === 401 ? "UNAUTHENTICATED" : "FORBIDDEN",
        message: "Admin access required.",
      },
    };
  }

  const workbook = await readWorkbookActionFile(formData);
  if (!workbook.ok) {
    return workbook.result;
  }

  const result = await applyAdminShowWorkbookImport({
    fileName: workbook.file.name,
    workbook: workbook.buffer,
  });
  if (!result.body.ok) {
    return {
      ok: false,
      error: {
        code: result.body.code ?? "SHOW_WORKBOOK_IMPORT_FAILED",
        message: result.body.error,
      },
    };
  }

  return {
    ok: true,
    data: result.body.data,
  };
}
