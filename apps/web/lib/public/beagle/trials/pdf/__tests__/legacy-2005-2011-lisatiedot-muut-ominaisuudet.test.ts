import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotMuutOminaisuudet } from "../rule-sets/legacy-2005-2011/lisatiedot/muut-ominaisuudet";

describe("drawLegacy2005To2011LisatiedotMuutOminaisuudet", () => {
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

  it("draws muut ominaisuudet rows as centered one-decimal values", () => {
    drawLegacy2005To2011LisatiedotMuutOminaisuudet({
      lisatiedotRows: [
        { koodi: "60", era1: "0", era2: "1" },
        { koodi: "61", era1: "3.25", era2: "-" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "0,0",
      expect.objectContaining({ x: 526, y: 85, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "1,0",
      expect.objectContaining({ x: 554, y: 85, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "3,3",
      expect.objectContaining({ x: 526, y: 65, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(3);
  });
});
