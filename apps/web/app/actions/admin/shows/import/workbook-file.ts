"use server";

import type { ActionResult } from "@beagle/contracts";

const MAX_WORKBOOK_SIZE_BYTES = 50 * 1024 * 1024;

type WorkbookActionFileResult =
  | { ok: true; file: File; buffer: Buffer }
  | {
      ok: false;
      result: ActionResult<never>;
    };

export async function readWorkbookActionFile(
  formData: FormData,
): Promise<WorkbookActionFileResult> {
  const value = formData.get("workbook");
  if (!(value instanceof File) || value.size === 0) {
    return {
      ok: false,
      result: {
        ok: false,
        error: {
          code: "INVALID_FILE",
          message: "Workbook file is required.",
        },
      },
    };
  }

  if (!value.name.trim().toLowerCase().endsWith(".xlsx")) {
    return {
      ok: false,
      result: {
        ok: false,
        error: {
          code: "INVALID_FILE",
          message: "Workbook file must use the .xlsx extension.",
        },
      },
    };
  }

  // Read only validated workbook uploads and reject oversized files before buffering them.
  if (value.size > MAX_WORKBOOK_SIZE_BYTES) {
    return {
      ok: false,
      result: {
        ok: false,
        error: {
          code: "INVALID_FILE",
          message: "Workbook file must be 50 MB or smaller.",
        },
      },
    };
  }

  return {
    ok: true,
    file: value,
    buffer: Buffer.from(await value.arrayBuffer()),
  };
}
