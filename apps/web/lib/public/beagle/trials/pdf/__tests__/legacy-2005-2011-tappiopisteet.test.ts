import type { PDFFont, PDFPage } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";
import {
  LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX,
  LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX,
  LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX,
  LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX,
  LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX,
  LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX,
  LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX,
  drawLegacy2005To2011Tappiopisteet,
} from "../rule-sets/legacy-2005-2011/tappiopisteet";

describe("drawLegacy2005To2011Tappiopisteet", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {
    widthOfTextAtSize: vi.fn(() => 20),
    heightAtSize: vi.fn(() => 10),
  } as unknown as PDFFont;

  it("draws loss points for the 2005-2011 template", () => {
    drawLegacy2005To2011Tappiopisteet({
      hakuloysyysTappioEra1: 1,
      hakuloysyysTappioEra2: 2.5,
      hakuloysyysTappioYhteensa: 3.5,
      ajoloysyysTappioEra1: 4,
      ajoloysyysTappioEra2: 5.25,
      ajoloysyysTappioYhteensa: 9.25,
      tappiopisteetYhteensa: 12.75,
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(7);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "1,00",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX.x +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX.y +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      2,
      "2,50",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX.x +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX.y +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      3,
      "3,50",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX.x +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX.y +
          (LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      4,
      "4,00",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX.x +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX.y +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      5,
      "5,25",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX.x +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX.y +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      6,
      "9,25",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX.x +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX.y +
          (LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX.height - 10) / 2,
      }),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      7,
      "12,75",
      expect.objectContaining({
        x:
          LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX.x +
          (LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX.width - 20) / 2,
        y:
          LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX.y +
          (LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX.height - 10) / 2,
      }),
    );
  });
});
