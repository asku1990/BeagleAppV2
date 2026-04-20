import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotMetsastysinto } from "../internal/lisatiedot/metsastysinto";

describe("drawTrialDogPdfLisatiedotMetsastysinto", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

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
      x: 670,
      y: 487.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0.0", {
      x: 687,
      y: 487.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "3.0", {
      x: 670,
      y: 473.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 687,
      y: 473.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "3.0", {
      x: 670,
      y: 459.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "0.0", {
      x: 687,
      y: 459.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
