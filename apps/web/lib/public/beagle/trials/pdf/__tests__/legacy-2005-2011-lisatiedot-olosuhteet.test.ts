import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011LisatiedotOlosuhteet } from "../rule-sets/legacy-2005-2011/lisatiedot/olosuhteet";

describe("drawLegacy2005To2011LisatiedotOlosuhteet", () => {
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

  it("draws marker and numeric olosuhteet values for both eras", () => {
    drawLegacy2005To2011LisatiedotOlosuhteet({
      lisatiedotRows: [
        { koodi: "11", era1: "1", era2: "0" },
        { koodi: "12", era1: "15", era2: "-" },
        { koodi: "17", era1: "12", era2: "18" },
        { koodi: "18", era1: "3", era2: "4,25" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "X",
      expect.objectContaining({ x: 526, y: 719, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "15",
      expect.objectContaining({ x: 526, y: 699, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "12",
      expect.objectContaining({ x: 526, y: 599, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "18",
      expect.objectContaining({ x: 554, y: 599, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "3,0",
      expect.objectContaining({ x: 526, y: 579, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "4,3",
      expect.objectContaining({ x: 554, y: 579, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenCalledTimes(6);
  });
});
