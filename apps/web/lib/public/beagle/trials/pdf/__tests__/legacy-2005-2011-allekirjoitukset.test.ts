import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawLegacy2005To2011Allekirjoitukset } from "../rule-sets/legacy-2005-2011/allekirjoitukset";

describe("drawLegacy2005To2011Allekirjoitukset", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws palkintotuomari and ylituomari fields for the 2005-2011 template", () => {
    drawLegacy2005To2011Allekirjoitukset({
      ryhmatuomariNimi: "Ryhmätuomari",
      palkintotuomariNimi: "Palkintotuomari",
      ylituomariNumeroSnapshot: "123445",
      ylituomariNimiSnapshot: "Ylituomari",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(4);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "Ryhmätuomari",
      expect.objectContaining({ x: 74, y: 169, size: 8, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      2,
      "Palkintotuomari",
      expect.objectContaining({ x: 74, y: 128, size: 8, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      3,
      "123445",
      expect.objectContaining({ x: 74, y: 68, size: 8, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      4,
      "Ylituomari",
      expect.objectContaining({ x: 132, y: 68, size: 8, font }),
    );
  });
});
