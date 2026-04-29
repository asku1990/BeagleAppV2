// Renders the final points and result markers for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLoppupisteet } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import {
  drawLegacy2005To2011CenteredText,
  formatLegacy2005To2011Score,
} from "./core";

export const LEGACY_2005_2011_LOPPUPISTEET_BOX = {
  x: 360,
  y: 377,
  width: 36,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_PALJAS_MAA_BOX = {
  x: 134,
  y: 377,
  width: 18,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_LUMI_BOX = {
  x: 134,
  y: 357,
  width: 18,
  height: 14,
  size: 12,
} as const;

/* export const LEGACY_2005_2011_LUOPUI_BOX = {
  x: 105,
  y: 337,
  width: 18,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_SULJETTU_BOX = {
  x: 160,
  y: 337,
  width: 18,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_KESKEYTETTY_BOX = {
  x: 215,
  y: 337,
  width: 18,
  height: 14,
  size: 12,
} as const; */

export const LEGACY_2005_2011_SIJOITUS_BOX = {
  x: 355,
  y: 357,
  width: 24,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_SIJOITUS_SEPARATOR_BOX = {
  x: 376,
  y: 357,
  width: 8,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_KOIRIA_LUOKASSA_BOX = {
  x: 380,
  y: 357,
  width: 24,
  height: 14,
  size: 12,
} as const;

export const LEGACY_2005_2011_PALKINTO_BOX = {
  x: 220,
  y: 357,
  width: 24,
  height: 14,
  size: 14,
} as const;

export function drawLegacy2005To2011Loppupisteet(
  input: TrialDogPdfLoppupisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;
  const sijoitus =
    input.koetyyppi === "PITKAKOE"
      ? "PK"
      : input.koetyyppi === "KOKOKAUDENKOE"
        ? "-"
        : input.sijoitus;
  const koiriaLuokassa =
    input.koetyyppi === "KOKOKAUDENKOE" ? "KK" : input.koiriaLuokassa;

  drawLegacy2005To2011CenteredText(
    page,
    font,
    formatLegacy2005To2011Score(input.loppupisteet),
    LEGACY_2005_2011_LOPPUPISTEET_BOX,
  );

  if (input.paljasMaaTaiLumi === "PALJAS_MAA") {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "X",
      LEGACY_2005_2011_PALJAS_MAA_BOX,
    );
  } else if (input.paljasMaaTaiLumi === "LUMI") {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "X",
      LEGACY_2005_2011_LUMI_BOX,
    );
  }

  /*   if (input.luopui) {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "X",
      LEGACY_2005_2011_LUOPUI_BOX,
    );
  }

  if (input.suljettu) {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "X",
      LEGACY_2005_2011_SULJETTU_BOX,
    );
  }

  if (input.keskeytetty) {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "X",
      LEGACY_2005_2011_KESKEYTETTY_BOX,
    );
  } */

  drawLegacy2005To2011CenteredText(
    page,
    font,
    sijoitus,
    LEGACY_2005_2011_SIJOITUS_BOX,
  );
  if (input.koetyyppi === "PITKAKOE" && koiriaLuokassa !== null) {
    drawLegacy2005To2011CenteredText(
      page,
      font,
      "/",
      LEGACY_2005_2011_SIJOITUS_SEPARATOR_BOX,
    );
  }
  drawLegacy2005To2011CenteredText(
    page,
    font,
    koiriaLuokassa,
    LEGACY_2005_2011_KOIRIA_LUOKASSA_BOX,
  );
  drawLegacy2005To2011CenteredText(
    page,
    font,
    input.Palkinto,
    LEGACY_2005_2011_PALKINTO_BOX,
  );
}
