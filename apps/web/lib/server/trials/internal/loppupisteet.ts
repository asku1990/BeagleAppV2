import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLoppupisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const LOPPUPISTEET = {
  x: 357,
  y: 124.3,
  size: 12,
} as const;

export function drawTrialDogPdfLoppuppisteet(
  input: TrialDogPdfLoppupisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawText(page, font, formatKoeEraValue(input.loppupisteet), LOPPUPISTEET);
}
