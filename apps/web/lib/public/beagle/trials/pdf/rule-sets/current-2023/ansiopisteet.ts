import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfAnsiopisteet } from "@contracts";
import {
  createScoreBox,
  drawCenteredScoreValue,
  SCORE_COLUMNS,
} from "./score-boxes";

// Ansiopisteet table: haku (row 1), haukku (row 2), ajotaito (row 3).
// metsastysintoEra1/2/Keskiarvo are part of the contract type but are NOT
// rendered here – they appear in the lisatiedot section (koodi 40-42).
const HAKU_ERA1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 243.3,
  size: 12,
});

const HAKU_ERA2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 243.3,
  size: 12,
});

const HAKUKESKIARVO_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 243.3,
  size: 12,
});

const HAUKKU_ERA1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 223.3,
  size: 12,
});

const HAUKKU_ERA2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 223.3,
  size: 12,
});

const HAUKKUKESKIARVO_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 223.3,
  size: 12,
});

const AJOTAITO_ERA1_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA1,
  y: 203.3,
  size: 12,
});

const AJOTAITO_ERA2_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.ERA2,
  y: 203.3,
  size: 12,
});

const AJOTAITOKESKIARVO_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.SUMMARY,
  y: 203.3,
  size: 12,
});

const ANSIOPISTEET_VALUE_BOX = createScoreBox({
  ...SCORE_COLUMNS.TOTAL,
  y: 223.3,
  size: 12,
});

export function drawTrialDogPdfAnsiopisteet(
  input: TrialDogPdfAnsiopisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawCenteredScoreValue(page, font, input.hakuEra1, HAKU_ERA1_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.hakuEra2, HAKU_ERA2_VALUE_BOX);
  drawCenteredScoreValue(
    page,
    font,
    input.hakuKeskiarvo,
    HAKUKESKIARVO_VALUE_BOX,
  );
  drawCenteredScoreValue(page, font, input.haukkuEra1, HAUKKU_ERA1_VALUE_BOX);
  drawCenteredScoreValue(page, font, input.haukkuEra2, HAUKKU_ERA2_VALUE_BOX);
  drawCenteredScoreValue(
    page,
    font,
    input.haukkuKeskiarvo,
    HAUKKUKESKIARVO_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajotaitoEra1,
    AJOTAITO_ERA1_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajotaitoEra2,
    AJOTAITO_ERA2_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ajotaitoKeskiarvo,
    AJOTAITOKESKIARVO_VALUE_BOX,
  );
  drawCenteredScoreValue(
    page,
    font,
    input.ansiopisteetYhteensa,
    ANSIOPISTEET_VALUE_BOX,
  );
}
