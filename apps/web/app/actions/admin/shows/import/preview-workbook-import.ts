"use server";

import type {
  ActionResult,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import { previewAdminShowWorkbookImport } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";
import { readWorkbookActionFile } from "./workbook-file";

export async function previewAdminShowWorkbookImportAction(
  formData: FormData,
): Promise<ActionResult<AdminShowWorkbookImportPreviewResponse>> {
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

  const result = await previewAdminShowWorkbookImport({
    fileName: workbook.file.name,
    workbook: workbook.buffer,
  });

  if (!result.body.ok) {
    return {
      ok: false,
      error: {
        code: result.body.code ?? "SHOW_WORKBOOK_PREVIEW_FAILED",
        message: result.body.error,
      },
    };
  }

  return {
    ok: true,
    data: result.body.data,
  };
}
