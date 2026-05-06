import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotOlosuhteet } from "../rule-sets/legacy-2011-2023/lisatiedot/olosuhteet";

describe("drawTrialDogPdfLisatiedotOlosuhteet", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {
    widthOfTextAtSize: vi.fn((text: string) => text.length * 5),
    heightAtSize: vi.fn(() => 8),
  } as unknown as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders olosuhteet 11-18 with marker and numeric rules", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [
        { koodi: "11", era1: "1", era2: null },
        { koodi: "12", era1: "0", era2: "0" },
        { koodi: "13", era1: "0", era2: "1" },
        { koodi: "14", era1: "1", era2: "1" },
        { koodi: "15", era1: "0", era2: "0" },
        { koodi: "16", era1: "0", era2: "0" },
        { koodi: "17", era1: "5", era2: "0" },
        { koodi: "18", era1: "0", era2: "5" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(10);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "X", {
      x: 593,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0", {
      x: 594,
      y: 474.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "0", {
      x: 611,
      y: 474.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "X", {
      x: 611,
      y: 459.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "X", {
      x: 593,
      y: 445.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "X", {
      x: 611,
      y: 445.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(7, "5", {
      x: 594,
      y: 402.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(8, "0", {
      x: 611,
      y: 402.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(9, "0", {
      x: 594,
      y: 388.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(10, "5", {
      x: 611,
      y: 388.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });

  it("does not render when paljas maa marker is missing", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [{ koodi: "11", era1: null, era2: null }],
      page,
      font,
    });

    expect(page.drawText).not.toHaveBeenCalled();
  });

  it("renders empty text for zero marker values", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [{ koodi: "11", era1: "1", era2: "0" }],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenNthCalledWith(1, "X", {
      x: 593,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenCalledTimes(1);
  });
});
