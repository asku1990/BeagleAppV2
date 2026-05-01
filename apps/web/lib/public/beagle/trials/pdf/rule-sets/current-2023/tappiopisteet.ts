import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfTappiopisteet } from "@contracts";
import {
  createScoreBox,
  drawCenteredScoreValue,
  SCORE_COLUMNS,
} from "./score-boxes";

const HAKULOYSYYS_ERA1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 164.3,
  size: 12,
});

const HAKULOYSYYS_ERA2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 164.3,
  size: 12,
});

const HAKULOYSYYS_YHTEENSA_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 164.3,
  size: 12,
});

const AJOLOYSYYS_ERA1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 144.3,
  size: 12,
});

const AJOLOYSYYS_ERA2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 144.3,
  size: 12,
});

const AJOLOYSYYS_YHTEENSA_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 144.3,
  size: 12,
});

const TAPPIOPISTEET_YHTEENSA_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.TOTAL,
  y: 144.3,
  size: 12,
});

export function drawTrialDogPdfTappiopisteet(
  input: TrialDogPdfTappiopisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawCenteredScoreValue(
    page,
    font,
    input.hakuloysyysTappioEra1,
    HAKULOYSYYS_ERA1_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.hakuloysyysTappioEra2,
    HAKULOYSYYS_ERA2_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.hakuloysyysTappioYhteensa,
    HAKULOYSYYS_YHTEENSA_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.tappiopisteetYhteensa,
    TAPPIOPISTEET_YHTEENSA_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajoloysyysTappioEra1,
    AJOLOYSYYS_ERA1_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajoloysyysTappioEra2,
    AJOLOYSYYS_ERA2_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajoloysyysTappioYhteensa,
    AJOLOYSYYS_YHTEENSA_VALUE_BOX,
  );
}
