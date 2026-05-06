import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfAllekirjoitukset } from "../rule-sets/current-2023/allekirjoitukset";

describe("drawCurrent2023TrialDogPdfAllekirjoitukset", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws ylituomari name for the 2023+ template", () => {
    drawTrialDogPdfAllekirjoitukset({
      ryhmatuomariNimi: "Ryhmätuomari",
      palkintotuomariNimi: "Palkintotuomari",
      ylituomariNumeroSnapshot: "123445",
      ylituomariNimi: "Ylituomari",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(4);
    expect(page.drawText).toHaveBeenNthCalledWith(4, "Ylituomari", {
      x: 570,
      y: 65,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
