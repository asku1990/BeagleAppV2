import type { TrialDogPdfKokeenTiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011Text, formatLegacy2005To2011Date } from "./core";

export function drawLegacy2005To2011KokeenTiedot(
  input: TrialDogPdfKokeenTiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011Text(page, font, input.kennelpiiri, {
    x: 110,
    y: 780,
    size: 12,
  });
  drawLegacy2005To2011Text(page, font, input.kennelpiirinro, {
    x: 360,
    y: 780,
    size: 12,
  });
  drawLegacy2005To2011Text(page, font, input.koekunta, {
    x: 110,
    y: 759,
    size: 12,
  });
  /*   drawLegacy2005To2011Text(page, font, input.koemaasto, {
    x: 200,
    y: 759,
    size: 12,
  }); */
  drawLegacy2005To2011Text(
    page,
    font,
    formatLegacy2005To2011Date(input.koepaiva),
    {
      x: 300,
      y: 759,
      size: 12,
    },
  );
  /*   drawLegacy2005To2011Text(page, font, input.jarjestaja, {
    x: 65,
    y: 736,
    size: 8,
  }); */
}
