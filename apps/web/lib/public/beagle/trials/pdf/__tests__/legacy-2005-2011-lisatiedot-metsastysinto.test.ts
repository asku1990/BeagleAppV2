import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotMetsastysinto } from "../rule-sets/legacy-2005-2011/lisatiedot/metsastysinto";

describe("drawLegacy2005To2011LisatiedotMetsastysinto", () => {
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

  it("draws metsästysinto rows as centered one-decimal values", () => {
    drawLegacy2005To2011LisatiedotMetsastysinto({
      lisatiedotRows: [
        { koodi: "40", era1: "3", era2: "2.5" },
        { koodi: "41", era1: null, era2: "1" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "3,0",
      expect.objectContaining({ x: 526, y: 300, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "2,5",
      expect.objectContaining({ x: 554, y: 300, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "1,0",
      expect.objectContaining({ x: 554, y: 280, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(3);
  });
});
