import { describe, expect, it } from "vitest";
import { readWorkbookActionFile } from "../workbook-file";

describe("readWorkbookActionFile", () => {
  it("returns an invalid file error when workbook is missing", async () => {
    const formData = new FormData();

    await expect(readWorkbookActionFile(formData)).resolves.toEqual({
      ok: false,
      result: {
        ok: false,
        error: {
          code: "INVALID_FILE",
          message: "Workbook file is required.",
        },
      },
    });
  });

  it("returns an invalid file error for a non-xlsx file", async () => {
    const formData = new FormData();
    formData.append("workbook", new File([Buffer.from("csv")], "shows.csv"));

    await expect(readWorkbookActionFile(formData)).resolves.toEqual({
      ok: false,
      result: {
        ok: false,
        error: {
          code: "INVALID_FILE",
          message: "Workbook file must use the .xlsx extension.",
        },
      },
    });
  });

  it("returns the file and buffer for a valid workbook", async () => {
    const workbookFile = new File([Buffer.from("xlsx")], "Näyttelyt.xlsx");
    const formData = new FormData();
    formData.append("workbook", workbookFile);

    const result = await readWorkbookActionFile(formData);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.file.name).toBe("Näyttelyt.xlsx");
    expect(result.buffer).toEqual(Buffer.from("xlsx"));
  });
});
