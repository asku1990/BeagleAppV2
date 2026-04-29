import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotMetsastysinto } from "../rule-sets/legacy-2011-2023/lisatiedot/metsastysinto";

describe("drawTrialDogPdfLisatiedotMetsastysinto", () => {
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

  it("renders metsästysinto 40-42 with one-decimal formatting", () => {
    drawTrialDogPdfLisatiedotMetsastysinto({
      lisatiedotRows: [
        { koodi: "40", era1: "4.00", era2: "0.00" },
        { koodi: "41", era1: "3.00", era2: "0.00" },
        { koodi: "42", era1: "3.00", era2: "0.00" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(6);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "4.0", {
      x: 781,
      y: 487.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0.0", {
      x: 798.5,
      y: 487.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "3.0", {
      x: 781,
      y: 473.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 798.5,
      y: 473.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "3.0", {
      x: 781,
      y: 459.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "0.0", {
      x: 798.5,
      y: 459.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
