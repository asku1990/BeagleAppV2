import type { TrialDogPdfAnsiopisteet } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import {
  drawLegacy2005To2011CenteredText,
  formatLegacy2005To2011Score,
} from "./core";

const LEGACY_2005_2011_HAKU_ERA1_BOX = {
  x: 150,
  y: 497,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAKU_ERA2_BOX = {
  x: 215,
  y: 497,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAKU_KESKIARVO_BOX = {
  x: 290,
  y: 497,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAUKKU_ERA1_BOX = {
  x: 150,
  y: 477,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAUKKU_ERA2_BOX = {
  x: 215,
  y: 477,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAUKKU_KESKIARVO_BOX = {
  x: 290,
  y: 477,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJOTAITO_ERA1_BOX = {
  x: 150,
  y: 437,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJOTAITO_ERA2_BOX = {
  x: 215,
  y: 437,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJOTAITO_KESKIARVO_BOX = {
  x: 290,
  y: 437,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_ANSIOPISTEET_YHTEENSA_BOX = {
  x: 360,
  y: 457,
  width: 36,
  height: 14,
  size: 12,
} as const;

export function drawLegacy2005To2011Ansiopisteet(
  input: TrialDogPdfAnsiopisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuEra1),
    LEGACY_2005_2011_HAKU_ERA1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuEra2),
    LEGACY_2005_2011_HAKU_ERA2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.hakuKeskiarvo),
    LEGACY_2005_2011_HAKU_KESKIARVO_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.haukkuEra1),
    LEGACY_2005_2011_HAUKKU_ERA1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.haukkuEra2),
    LEGACY_2005_2011_HAUKKU_ERA2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.haukkuKeskiarvo),
    LEGACY_2005_2011_HAUKKU_KESKIARVO_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajotaitoEra1),
    LEGACY_2005_2011_AJOTAITO_ERA1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajotaitoEra2),
    LEGACY_2005_2011_AJOTAITO_ERA2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajotaitoKeskiarvo),
    LEGACY_2005_2011_AJOTAITO_KESKIARVO_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ansiopisteetYhteensa),
    LEGACY_2005_2011_ANSIOPISTEET_YHTEENSA_BOX,
  );
}
