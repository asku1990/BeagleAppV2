import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfAllekirjoitukset } from "../internal/allekirjoitukset";

describe("drawTrialDogPdfAllekirjoitukset", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dashes for missing judge names", () => {
    drawTrialDogPdfAllekirjoitukset({
      ryhmatuomariNimi: null,
      palkintotuomariNimi: "",
      ylituomariNumeroSnapshot: "123445",
      ylituomariNimiSnapshot: "Testi Nimi",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(4);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "-", {
      x: 513,
      y: 161.6,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "-", {
      x: 513,
      y: 122.6,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "123445", {
      x: 513,
      y: 82.7,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "Testi Nimi", {
      x: 570,
      y: 82.7,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
