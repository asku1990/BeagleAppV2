import { drawCenteredText, formatKoeEraValue } from "./koe-erat-common";
import type { PDFFont, PDFPage } from "pdf-lib";

const SCORE_BOX_HEIGHT = 14;
const SCORE_BOX_BASELINE_OFFSET_Y = 3;

// Main score tables share the same four value columns on the left side of the
// template: era 1, era 2, row sum/average, and section total.
export const LEGACY_2011_2023_SCORE_COLUMNS = {
  ERA1: { x: 123, width: 72 },
  ERA2: { x: 195, width: 72 },
  SUMMARY: { x: 267, width: 72 },
  TOTAL: { x: 340, width: 72 },
} as const;

export type Legacy2011To2023ScoreBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
};

export function createLegacy2011To2023ScoreBox(anchor: {
  x: number;
  y: number;
  width: number;
  size: number;
}): Legacy2011To2023ScoreBox {
  return {
    x: anchor.x,
    y: anchor.y - SCORE_BOX_BASELINE_OFFSET_Y,
    width: anchor.width,
    height: SCORE_BOX_HEIGHT,
    size: anchor.size,
  };
}

export function drawLegacy2011To2023CenteredScoreValue(
  page: PDFPage,
  font: PDFFont,
  value: string | number | null | undefined,
  box: Legacy2011To2023ScoreBox,
): void {
  drawCenteredText(page, font, formatKoeEraValue(value), box);
}
