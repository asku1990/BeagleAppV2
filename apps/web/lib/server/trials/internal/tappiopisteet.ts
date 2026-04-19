import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfTappiopisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const HAKULOYSYYS_ERA1_VALUE_FIELD = {
  x: 147,
  y: 164.3,
  size: 12,
} as const;

const HAKULOYSYYS_ERA2_VALUE_FIELD = {
  x: 221,
  y: 164.3,
  size: 12,
} as const;

export function drawTrialDogPdfTappiopisteet(
  input: TrialDogPdfTappiopisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuloysyysTappioEra1),
    HAKULOYSYYS_ERA1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuloysyysTappioEra2),
    HAKULOYSYYS_ERA2_VALUE_FIELD,
  );
}
