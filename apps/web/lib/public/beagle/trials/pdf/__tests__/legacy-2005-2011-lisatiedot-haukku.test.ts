import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotHaukku } from "../rule-sets/legacy-2005-2011/lisatiedot/haukku";

describe("drawLegacy2005To2011LisatiedotHaukku", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {
    widthOfTextAtSize: vi.fn(() => 5),
    heightAtSize: vi.fn(() => 8),
  } as unknown as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws haukku rows as centered one-decimal values", () => {
    drawLegacy2005To2011LisatiedotHaukku({
      lisatiedotRows: [
        { koodi: "30", era1: "4", era2: "0" },
        { koodi: "36", era1: "5,25", era2: "-" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "4,0",
      expect.objectContaining({ x: 526, y: 460, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "0,0",
      expect.objectContaining({ x: 554, y: 460, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "5,3",
      expect.objectContaining({ x: 526, y: 340, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(3);
  });
});
