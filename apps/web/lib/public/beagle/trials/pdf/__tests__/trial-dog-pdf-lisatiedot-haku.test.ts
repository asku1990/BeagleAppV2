import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotHaku } from "../rule-sets/legacy-2011-2023/lisatiedot/haku";

describe("drawTrialDogPdfLisatiedotHaku", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders haku 20-22 with integer and one-decimal formatting", () => {
    drawTrialDogPdfLisatiedotHaku({
      lisatiedotRows: [
        { koodi: "20", era1: "4", era2: "0" },
        { koodi: "21", era1: "3.00", era2: "0.00" },
        { koodi: "22", era1: "2,25", era2: "1.00" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(6);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "4", {
      x: 590,
      y: 360.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0", {
      x: 607,
      y: 360.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "3.0", {
      x: 590,
      y: 346.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 607,
      y: 346.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "2.3", {
      x: 590,
      y: 332.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "1.0", {
      x: 607,
      y: 332.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });

  it("skips empty haku values", () => {
    drawTrialDogPdfLisatiedotHaku({
      lisatiedotRows: [{ koodi: "20", era1: null, era2: null }],
      page,
      font,
    });

    expect(page.drawText).not.toHaveBeenCalled();
  });
});
