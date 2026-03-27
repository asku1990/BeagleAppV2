"use server";

import type {
  ActionResult,
  AdminShowWorkbookImportApplyResponse,
} from "@beagle/contracts";
import { applyAdminShowWorkbookImport } from "@beagle/server";
import { requireAdminLayoutAccess } from "@/lib/server/admin-guard";

function getWorkbookFile(formData: FormData): File | null {
  const value = formData.get("workbook");
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  return value;
}

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
  const result = await applyAdminShowWorkbookImport({
    fileName: workbook.name,
    workbook: workbookBuffer,
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
