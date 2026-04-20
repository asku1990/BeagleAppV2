import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const LISATIETO_11_ERA1_FIELD = {
  x: 592,
  y: 487.5,
  size: 12,
} as const;

const LISATIETO_11_ERA2_FIELD = {
  x: 609,
  y: 487.5,
  size: 12,
} as const;

// Draws lisätieto 11 values near the signatures block for quick visibility.
export function drawTrialDogPdfLisatieto11(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const row11 = input.lisatiedotRows?.find((row) => row.koodi === "11");
  const era1Source = formatKoeEraValue(row11?.era1).trim().toUpperCase();
  const era2Source = formatKoeEraValue(row11?.era2).trim().toUpperCase();
  const era1 = era1Source === "1" || era1Source === "X" ? "X" : "";
  const era2 = era2Source === "1" || era2Source === "X" ? "X" : "";

  if (!era1 && !era2) {
    return;
  }

  drawText(input.page, input.font, era1, LISATIETO_11_ERA1_FIELD);
  drawText(input.page, input.font, era2, LISATIETO_11_ERA2_FIELD);
}
