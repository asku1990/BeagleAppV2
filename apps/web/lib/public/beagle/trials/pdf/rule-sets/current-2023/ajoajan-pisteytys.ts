import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfAjoajanPisteytys } from "@contracts";
import {
  createScoreBox,
  drawCenteredScoreValue,
  SCORE_COLUMNS,
} from "./score-boxes";

const ERA1_ALKOI_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 322.3,
  size: 12,
});

const ERA2_ALKOI_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 322.3,
  size: 12,
});

const HAKU_MIN1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 305.3,
  size: 12,
});

const HAKU_MIN2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 305.3,
  size: 12,
});

const AJO_MIN1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 285.3,
  size: 12,
});

const AJO_MIN2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 285.3,
  size: 12,
});

const HYVAKSYTYT_AJOMINUUTIT_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 305.3,
  size: 12,
});

const AJOAJAN_PISTEET_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.TOTAL,
  y: 305.3,
  size: 12,
});

export function drawTrialDogPdfAjoajanPisteytys(
  input: TrialDogPdfAjoajanPisteytys & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawCenteredScoreValue(page, font, input.era1Alkoi, ERA1_ALKOI_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.era2Alkoi, ERA2_ALKOI_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.hakuMin1, HAKU_MIN1_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.hakuMin2, HAKU_MIN2_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.ajoMin1, AJO_MIN1_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.ajoMin2, AJO_MIN2_VALUE_BOX);
  drawCenteredScoreValue(
    page,
    font,
    input.hyvaksytytAjominuutit,
    HYVAKSYTYT_AJOMINUUTIT_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajoajanPisteet,
    AJOAJAN_PISTEET_VALUE_BOX,
  );
}
