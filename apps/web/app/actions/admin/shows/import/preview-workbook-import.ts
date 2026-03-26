"use server";

import type {
  ActionResult,
  AdminShowWorkbookImportPreviewResponse,
} from "@beagle/contracts";
import { previewAdminShowWorkbookImport } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

function getWorkbookFile(formData: FormData): File | null {
  const value = formData.get("workbook");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

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

  const workbook = getWorkbookFile(formData);
  if (!workbook) {
    return {
      ok: false,
      error: {
        code: "INVALID_FILE",
        message: "Workbook file is required.",
      },
    };
  }

  if (!workbook.name.toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false,
      error: {
        code: "INVALID_FILE",
        message: "Workbook file must use the .xlsx extension.",
      },
    };
  }

  const workbookBuffer = Buffer.from(await workbook.arrayBuffer());
  const result = await previewAdminShowWorkbookImport({
    fileName: workbook.name,
    workbook: workbookBuffer,
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
