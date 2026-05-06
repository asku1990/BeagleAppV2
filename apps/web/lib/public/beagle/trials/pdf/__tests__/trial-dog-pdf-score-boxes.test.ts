import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfAjoajanPisteytys } from "../rule-sets/legacy-2011-2023/ajoajan-pisteytys";
import { drawTrialDogPdfAnsiopisteet } from "../rule-sets/legacy-2011-2023/ansiopisteet";
import { drawTrialDogPdfTappiopisteet } from "../rule-sets/legacy-2011-2023/tappiopisteet";

describe("legacy 2011-2023 score boxes", () => {
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

  it("centers ajoajan pisteytys values in the existing cells", () => {
    drawTrialDogPdfAjoajanPisteytys({
      era1Alkoi: "5:49",
      era2Alkoi: "11:47",
      hakuMin1: 4,
      hakuMin2: 12,
      ajoMin1: 3,
      ajoMin2: 51,
      hyvaksytytAjominuutit: 51,
      ajoajanPisteet: 14.88,
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(8);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "05:49",
      expect.objectContaining({ x: 146.5, y: 322.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      3,
      "4",
      expect.objectContaining({ x: 156.5, y: 305.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      4,
      "12",
      expect.objectContaining({ x: 226, y: 305.3, size: 12, font }),
    );
  });

  it("centers ansiopisteet values in the existing cells", () => {
    drawTrialDogPdfAnsiopisteet({
      hakuEra1: 3,
      hakuEra2: 12,
      hakuKeskiarvo: 3.5,
      haukkuEra1: 7,
      haukkuEra2: 0,
      haukkuKeskiarvo: 7,
      metsastysintoEra1: null,
      metsastysintoEra2: null,
      metsastysintoKeskiarvo: null,
      ajotaitoEra1: 4,
      ajotaitoEra2: 0,
      ajotaitoKeskiarvo: 4,
      ansiopisteetYhteensa: 14.5,
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(10);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "3",
      expect.objectContaining({ x: 156.5, y: 243.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      2,
      "12",
      expect.objectContaining({ x: 226, y: 243.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      10,
      "14.5",
      expect.objectContaining({ x: 366, y: 223.3, size: 12, font }),
    );
  });

  it("centers tappiopisteet values in the existing cells", () => {
    drawTrialDogPdfTappiopisteet({
      hakuloysyysTappioEra1: 0,
      hakuloysyysTappioEra2: 12,
      hakuloysyysTappioYhteensa: 12,
      ajoloysyysTappioEra1: 0,
      ajoloysyysTappioEra2: 1,
      ajoloysyysTappioYhteensa: 1,
      tappiopisteetYhteensa: 13,
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(7);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "0",
      expect.objectContaining({ x: 156.5, y: 164.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      2,
      "12",
      expect.objectContaining({ x: 226, y: 164.3, size: 12, font }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      4,
      "13",
      expect.objectContaining({ x: 371, y: 144.3, size: 12, font }),
    );
  });
});
