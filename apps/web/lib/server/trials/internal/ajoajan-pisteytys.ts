import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfAjoajanPisteytys } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const ERA1_ALKOI_VALUE_FIELD = {
  x: 142,
  y: 322.3,
  size: 12,
} as const;

const ERA2_ALKOI_VALUE_FIELD = {
  x: 215,
  y: 322.3,
  size: 12,
} as const;

const HAKU_MIN1_VALUE_FIELD = {
  x: 147,
  y: 305.3,
  size: 12,
} as const;

const HAKU_MIN2_VALUE_FIELD = {
  x: 221,
  y: 305.3,
  size: 12,
} as const;

const AJO_MIN1_VALUE_FIELD = {
  x: 147,
  y: 285.3,
  size: 12,
} as const;

const AJO_MIN2_VALUE_FIELD = {
  x: 221,
  y: 285.3,
  size: 12,
} as const;

const HYVAKSYTYT_AJOMINUUTIT_FIELD = {
  x: 286,
  y: 305.3,
  size: 12,
} as const;

const AJOAJAN_PISTEET_VALUE_FIELD = {
  x: 357,
  y: 305.3,
  size: 12,
} as const;

// Renders the AJOK era timings and minute-based result fields.
type AjoajanPisteytysInput = TrialDogPdfAjoajanPisteytys & {
  page: PDFPage;
  font: PDFFont;
};

export function drawTrialDogPdfAjoajanPisteytys(
  input: AjoajanPisteytysInput,
): void {
  const { page, font } = input;

  drawText(
    page,
    font,
    formatKoeEraValue(input.era1Alkoi),
    ERA1_ALKOI_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.era2Alkoi),
    ERA2_ALKOI_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuMin1),
    HAKU_MIN1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuMin2),
    HAKU_MIN2_VALUE_FIELD,
  );
  drawText(page, font, formatKoeEraValue(input.ajoMin1), AJO_MIN1_VALUE_FIELD);
  drawText(page, font, formatKoeEraValue(input.ajoMin2), AJO_MIN2_VALUE_FIELD);
  drawText(
    page,
    font,
    formatKoeEraValue(input.hyvaksytytAjominuutit),
    HYVAKSYTYT_AJOMINUUTIT_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajoajanPisteet),
    AJOAJAN_PISTEET_VALUE_FIELD,
  );
}
