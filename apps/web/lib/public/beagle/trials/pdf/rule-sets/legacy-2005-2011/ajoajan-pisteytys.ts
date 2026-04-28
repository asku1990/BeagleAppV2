import type { TrialDogPdfAjoajanPisteytys } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import {
  drawLegacy2005To2011CenteredText,
  formatLegacy2005To2011Score,
} from "./core";

const LEGACY_2005_2011_ERA1_ALKOI_BOX = {
  x: 150,
  y: 558,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_ERA2_ALKOI_BOX = {
  x: 215,
  y: 558,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAKU_MIN1_BOX = {
  x: 150,
  y: 538,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HAKU_MIN2_BOX = {
  x: 215,
  y: 538,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJO_MIN1_BOX = {
  x: 150,
  y: 518,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJO_MIN2_BOX = {
  x: 215,
  y: 518,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_HYVAKSYTYT_AJOMINUUTIT_BOX = {
  x: 360,
  y: 518,
  width: 36,
  height: 14,
  size: 12,
} as const;

const LEGACY_2005_2011_AJOAJAN_PISTEET_BOX = {
  x: 290,
  y: 518,
  width: 36,
  height: 14,
  size: 12,
} as const;

export function drawLegacy2005To2011AjoajanPisteytys(
  input: TrialDogPdfAjoajanPisteytys & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.era1Alkoi,
    LEGACY_2005_2011_ERA1_ALKOI_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.era2Alkoi,
    LEGACY_2005_2011_ERA2_ALKOI_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.hakuMin1,
    LEGACY_2005_2011_HAKU_MIN1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.hakuMin2,
    LEGACY_2005_2011_HAKU_MIN2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.ajoMin1,
    LEGACY_2005_2011_AJO_MIN1_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.ajoMin2,
    LEGACY_2005_2011_AJO_MIN2_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.hyvaksytytAjominuutit,
    LEGACY_2005_2011_HYVAKSYTYT_AJOMINUUTIT_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.ajoajanPisteet),
    LEGACY_2005_2011_AJOAJAN_PISTEET_BOX,
  );
}
