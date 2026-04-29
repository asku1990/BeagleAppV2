import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotAjo } from "../rule-sets/legacy-2005-2011/lisatiedot/ajo";

describe("drawLegacy2005To2011LisatiedotAjo", () => {
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

  it("draws ajo rows as centered one-decimal values", () => {
    drawLegacy2005To2011LisatiedotAjo({
      lisatiedotRows: [
        { koodi: "50", era1: "3", era2: "4" },
        { koodi: "56", era1: "5.25", era2: "-" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "3,0",
      expect.objectContaining({ x: 526, y: 239, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "4,0",
      expect.objectContaining({ x: 554, y: 239, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "5,3",
      expect.objectContaining({ x: 526, y: 119, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(3);
  });
});
