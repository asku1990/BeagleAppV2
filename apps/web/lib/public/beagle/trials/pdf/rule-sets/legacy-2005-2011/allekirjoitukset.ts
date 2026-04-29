// Renders judge name fields for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfAllekirjoitukset } from "@contracts/trials/trial-dog-pdf";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011Text } from "./core";

/* const PALKINTOTUOMARI_1_FIELD = {
  x: 74,
  y: 169,
  size: 8,
} as const;

const PALKINTOTUOMARI_2_FIELD = {
  x: 74,
  y: 128,
  size: 8,
} as const;

const YLITUOMARI_NUMERO_FIELD = {
  x: 74,
  y: 68,
  size: 8,
} as const; */

const YLITUOMARI_NIMI_FIELD = {
  x: 132,
  y: 63,
  size: 11,
} as const;

export function drawLegacy2005To2011Allekirjoitukset(
  input: TrialDogPdfAllekirjoitukset & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  /*   drawLegacy2005To2011Text(
    page,
    font,
    input.ryhmatuomariNimi,
    PALKINTOTUOMARI_1_FIELD,
  );

  drawLegacy2005To2011Text(
    page,
    font,
    input.palkintotuomariNimi,
    PALKINTOTUOMARI_2_FIELD,
  );

  drawLegacy2005To2011Text(
    page,
    font,
    input.ylituomariNumeroSnapshot,
    YLITUOMARI_NUMERO_FIELD,
  ); */

  drawLegacy2005To2011Text(
    page,
    font,
    input.ylituomariNimiSnapshot,
    YLITUOMARI_NIMI_FIELD,
  );
}
