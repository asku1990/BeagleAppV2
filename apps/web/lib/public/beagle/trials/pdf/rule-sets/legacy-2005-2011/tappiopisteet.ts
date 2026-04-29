// Renders the loss-point block for the AJOK 2005-2011 dog-specific PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfTappiopisteet } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import {
  drawLegacy2005To2011CenteredText,
  formatLegacy2005To2011Score,
} from "./core";

export const LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX = {
  x: 150,
  y: 417,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX = {
  x: 215,
  y: 417,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX = {
  x: 290,
  y: 417,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX = {
  x: 150,
  y: 397,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX = {
  x: 215,
  y: 397,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX = {
  x: 290,
  y: 397,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX = {
  x: 360,
  y: 397,
  width: 36,
  height: 14,
  size: 12,
} as const;

export function drawLegacy2005To2011Tappiopisteet(
  input: TrialDogPdfTappiopisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuloysyysTappioEra1),
    LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuloysyysTappioEra2),
    LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_ERA2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuloysyysTappioYhteensa),
    LEGACY_2005_2011_HAKULOYSYYS_TAPPIO_YHTEENSA_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajoloysyysTappioEra1),
    LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajoloysyysTappioEra2),
    LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_ERA2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajoloysyysTappioYhteensa),
    LEGACY_2005_2011_AJOLOYSYYS_TAPPIO_YHTEENSA_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.tappiopisteetYhteensa),
    LEGACY_2005_2011_TAPPIOPISTEET_YHTEENSA_BOX,
  );
}
