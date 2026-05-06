import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotMuutOminaisuudet } from "../rule-sets/legacy-2011-2023/lisatiedot/muut-ominaisuudet";

describe("drawTrialDogPdfLisatiedotMuutOminaisuudet", () => {
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

  it("renders muut ominaisuudet 60-61 with one-decimal formatting", () => {
    drawTrialDogPdfLisatiedotMuutOminaisuudet({
      lisatiedotRows: [
        { koodi: "60", era1: "3.00", era2: "0.00" },
        { koodi: "61", era1: "0.00", era2: "0.00" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(4);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "3.0", {
      x: 781,
      y: 303.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0.0", {
      x: 798.5,
      y: 303.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "0.0", {
      x: 781,
      y: 289.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 798.5,
      y: 289.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
