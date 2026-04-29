import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_2005_2011_KOIRIA_LUOKASSA_BOX,
  LEGACY_2005_2011_LOPPUPISTEET_BOX,
  LEGACY_2005_2011_PALKINTO_BOX,
  LEGACY_2005_2011_PALJAS_MAA_BOX,
  LEGACY_2005_2011_SIJOITUS_BOX,
  LEGACY_2005_2011_SIJOITUS_SEPARATOR_BOX,
  drawLegacy2005To2011Loppupisteet,
} from "../rule-sets/legacy-2005-2011/loppupisteet";

const page = {
  drawText: vi.fn(),
} as unknown as PDFPage;
const font = {
  widthOfTextAtSize: vi.fn(() => 20),
  heightAtSize: vi.fn(() => 10),
} as unknown as PDFFont;

describe("drawLegacy2005To2011Loppupisteet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws final points and result markers for the 2005-2011 template", () => {
    drawLegacy2005To2011Loppupisteet({
      loppupisteet: 72.5,
      paljasMaaTaiLumi: "PALJAS_MAA",
      luopui: true,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: "1",
      koiriaLuokassa: 5,
      Palkinto: "1",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(5);
    expect(page.drawText).toHaveBeenNthCalledWith(
      1,
      "72,50",
      centeredIn(LEGACY_2005_2011_LOPPUPISTEET_BOX),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      2,
      "X",
      centeredIn(LEGACY_2005_2011_PALJAS_MAA_BOX),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      3,
      "1",
      centeredIn(LEGACY_2005_2011_SIJOITUS_BOX),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      4,
      "5",
      centeredIn(LEGACY_2005_2011_KOIRIA_LUOKASSA_BOX),
    );
    expect(page.drawText).toHaveBeenNthCalledWith(
      5,
      "1",
      centeredIn(LEGACY_2005_2011_PALKINTO_BOX),
    );
  });

  it("uses the long-running trial label with the class count", () => {
    drawLegacy2005To2011Loppupisteet({
      loppupisteet: 72.5,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "PITKAKOE",
      sijoitus: "1",
      koiriaLuokassa: 5,
      Palkinto: "1",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "PK",
      centeredIn(LEGACY_2005_2011_SIJOITUS_BOX),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "/",
      centeredIn(LEGACY_2005_2011_SIJOITUS_SEPARATOR_BOX),
    );
    expect(page.drawText).toHaveBeenCalledWith(
      "5",
      centeredIn(LEGACY_2005_2011_KOIRIA_LUOKASSA_BOX),
    );
  });
});

function centeredIn(box: {
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
}) {
  return expect.objectContaining({
    x: box.x + (box.width - 20) / 2,
    y: box.y + (box.height - 10) / 2,
    size: box.size,
    font,
    color: expect.any(Object),
  });
}
