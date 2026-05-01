import { drawCenteredText, formatKoeEraValue } from "./koe-erat-common";
import type { PDFFont, PDFPage } from "pdf-lib";

const SCORE_BOX_HEIGHT = 14;
const SCORE_BOX_BASELINE_OFFSET_Y = 3;

// Main score tables share the same four value columns on the left side of the
// template: era 1, era 2, row sum/average, and section total.
export const SCORE_COLUMNS = {
  ERA1: { x: 123, width: 72 },
  ERA2: { x: 195, width: 72 },
  SUMMARY: { x: 267, width: 72 },
  TOTAL: { x: 340, width: 72 },
} as const;

export type ScoreBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
};

export function createScoreBox(anchor: {
  x: number;
  y: number;
  width: number;
  size: number;
}): ScoreBox {
  return {
    x: anchor.x,
    y: anchor.y - SCORE_BOX_BASELINE_OFFSET_Y,
    width: anchor.width,
    height: SCORE_BOX_HEIGHT,
    size: anchor.size,
  };
}

export function drawCenteredScoreValue(
  page: PDFPage,
  font: PDFFont,
  value: string | number | null | undefined,
  box: ScoreBox,
): void {
  drawCenteredText(page, font, formatKoeEraValue(value), box);
}
