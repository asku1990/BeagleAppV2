"use server";

import type { ActionResult } from "@beagle/contracts";

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

  return {
    ok: true,
    file: value,
    buffer: Buffer.from(await value.arrayBuffer()),
  };
}
