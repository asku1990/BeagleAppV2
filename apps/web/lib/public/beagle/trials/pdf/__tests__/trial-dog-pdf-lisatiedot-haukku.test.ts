import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotHaukku } from "../internal/lisatiedot/haukku";

describe("drawTrialDogPdfLisatiedotHaukku", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders haukku 30-36 with decimal and integer formatting", () => {
    drawTrialDogPdfLisatiedotHaukku({
      lisatiedotRows: [
        { koodi: "30", era1: "4.00", era2: "0.00" },
        { koodi: "31", era1: "3.00", era2: "0.00" },
        { koodi: "32", era1: "3.00", era2: "0.00" },
        { koodi: "33", era1: "3.00", era2: "0.00" },
        { koodi: "34", era1: "3.00", era2: "0.00" },
        { koodi: "35", era1: "5.00", era2: "0.00" },
        { koodi: "36", era1: "4", era2: "0" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(14);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "4.0", {
      x: 590,
      y: 304.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0.0", {
      x: 607,
      y: 304.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "3.0", {
      x: 590,
      y: 290.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 607,
      y: 290.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "3.0", {
      x: 590,
      y: 276.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "0.0", {
      x: 607,
      y: 276.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(7, "3.0", {
      x: 590,
      y: 262.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(8, "0.0", {
      x: 607,
      y: 262.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(9, "3.0", {
      x: 590,
      y: 248.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(10, "0.0", {
      x: 607,
      y: 248.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(11, "5.0", {
      x: 590,
      y: 234.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(12, "0.0", {
      x: 607,
      y: 234.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(13, "4", {
      x: 590,
      y: 220.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(14, "0", {
      x: 607,
      y: 220.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
