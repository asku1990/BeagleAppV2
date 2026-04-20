import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfAllekirjoitukset } from "@contracts/trials/trial-dog-pdf";

const RYHMATUOMARI_FIELD = {
  x: 513,
  y: 161.6,
  size: 10,
} as const;

function drawText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  field: { x: number; y: number; size: number },
): void {
  page.drawText(text, {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function drawTrialDogPdfAllekirjoitukset(
  input: TrialDogPdfAllekirjoitukset & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  if (input.ryhmatuomariNimi) {
    drawText(page, font, input.ryhmatuomariNimi, RYHMATUOMARI_FIELD);
  }
}
