import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfAllekirjoitukset } from "@contracts/trials/trial-dog-pdf";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const RYHMATUOMARI_FIELD = {
  x: 513,
  y: 161.6,
  size: 10,
} as const;

const PALKINTOTUOMARI_FIELD = {
  x: 513,
  y: 122.6,
  size: 10,
} as const;

const YLITUOMARI_NUMERO_FIELD = {
  x: 513,
  y: 82.7,
  size: 10,
} as const;

const YLITUOMARI_NIMI_FIELD = {
  x: 570,
  y: 82.7,
  size: 10,
} as const;

export function drawTrialDogPdfAllekirjoitukset(
  input: TrialDogPdfAllekirjoitukset & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawText(
    page,
    font,
    formatKoeEraValue(input.ryhmatuomariNimi),
    RYHMATUOMARI_FIELD,
  );

  drawText(
    page,
    font,
    formatKoeEraValue(input.palkintotuomariNimi),
    PALKINTOTUOMARI_FIELD,
  );

  drawText(
    page,
    font,
    formatKoeEraValue(input.ylituomariNumeroSnapshot),
    YLITUOMARI_NUMERO_FIELD,
  );

  drawText(
    page,
    font,
    formatKoeEraValue(input.ylituomariNimiSnapshot),
    YLITUOMARI_NIMI_FIELD,
  );
}
