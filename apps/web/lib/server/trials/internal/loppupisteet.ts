import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLoppupisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const LOPPUPISTEET = {
  x: 357,
  y: 124.3,
  size: 12,
} as const;

const PALJAS_MAA_X_FIELD = {
  x: 37.5,
  y: 114.3,
  size: 12,
} as const;

const LUMI_X_FIELD = {
  x: 107.5,
  y: 114.3,
  size: 12,
} as const;

const PALKINTO = {
  x: 220,
  y: 110.3,
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

  if (input.paljasMaaTaiLumi === "PALJAS_MAA") {
    drawText(page, font, "X", PALJAS_MAA_X_FIELD);
  } else if (input.paljasMaaTaiLumi === "LUMI") {
    drawText(page, font, "X", LUMI_X_FIELD);
  }

  drawText(page, font, formatKoeEraValue(input.Palkinto), PALKINTO);
}
