import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotHaku } from "../rule-sets/legacy-2005-2011/lisatiedot/haku";

describe("drawLegacy2005To2011LisatiedotHaku", () => {
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

  it("draws haku values as one decimal for both eras", () => {
    drawLegacy2005To2011LisatiedotHaku({
      lisatiedotRows: [
        { koodi: "20", era1: "3", era2: "4,25" },
        { koodi: "21", era1: "2.5", era2: "-" },
        { koodi: "22", era1: null, era2: "1" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "3,0",
      expect.objectContaining({ x: 526, y: 540, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "4,3",
      expect.objectContaining({ x: 554, y: 540, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "2,5",
      expect.objectContaining({ x: 526, y: 520, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "1,0",
      expect.objectContaining({ x: 554, y: 500, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(4);
  });
});
