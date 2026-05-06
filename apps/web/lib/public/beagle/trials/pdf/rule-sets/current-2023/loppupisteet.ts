import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfLoppupisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const LOPPUPISTEET_BOX = {
  x: 363,
  y: 145.3,
  width: 44,
  height: 14,
  size: 12,
} as const;

const PALJAS_MAA_X_FIELD = {
  x: 80,
  y: 137,
  size: 12,
} as const;

const LUMI_X_FIELD = {
  x: 143,
  y: 137,
  size: 12,
} as const;

const LUOPUI_X_FIELD = {
  x: 143,
  y: 110.7,
  size: 12,
} as const;

const SULJETTU_X_FIELD = {
  x: 190,
  y: 110.7,
  size: 12,
} as const;

const KESKEYTETTY_X_FIELD = {
  x: 240,
  y: 110.7,
  size: 12,
} as const;

const SIJOITUS_KOIRIA_LUOKASSA_BOX = {
  x: 358.5,
  y: 128,
  width: 53,
  height: 14,
  size: 12,
} as const;

const PALKINTO = {
  x: 240,
  y: 132.3,
  size: 14,
} as const;

function fitTextSize(
  font: PDFFont,
  text: string,
  size: number,
  maxWidth: number,
): number {
  let currentSize = size;

  while (
    currentSize > 8 &&
    font.widthOfTextAtSize(text, currentSize) > maxWidth
  ) {
    currentSize -= 0.25;
  }

  return currentSize;
}

function drawCenteredTextInBox(
  page: PDFPage,
  font: PDFFont,
  text: string,
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
    size: number;
  },
): void {
  const size = fitTextSize(font, text, box.size, box.width);
  const textWidth = font.widthOfTextAtSize(text, size);
  const textHeight = font.heightAtSize(size);

  page.drawText(text, {
    x: box.x + (box.width - textWidth) / 2,
    y: box.y + (box.height - textHeight) / 2,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function drawTrialDogPdfLoppupisteet(
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

  drawCenteredTextInBox(
    page,
    font,
    formatKoeEraValue(input.loppupisteet),
    LOPPUPISTEET_BOX,
  );

  if (input.paljasMaaTaiLumi === "PALJAS_MAA") {
    drawText(page, font, "X", PALJAS_MAA_X_FIELD);
  } else if (input.paljasMaaTaiLumi === "LUMI") {
    drawText(page, font, "X", LUMI_X_FIELD);
  }

  if (input.luopui) {
    drawText(page, font, "X", LUOPUI_X_FIELD);
  }

  if (input.suljettu) {
    drawText(page, font, "X", SULJETTU_X_FIELD);
  }

  if (input.keskeytetty) {
    drawText(page, font, "X", KESKEYTETTY_X_FIELD);
  }

  const sijoitusKoiriaLuokassaText = `${formatKoeEraValue(sijoitus)} / ${formatKoeEraValue(koiriaLuokassa)}`;
  drawCenteredTextInBox(
    page,
    font,
    sijoitusKoiriaLuokassaText,
    SIJOITUS_KOIRIA_LUOKASSA_BOX,
  );

  drawText(page, font, formatKoeEraValue(input.Palkinto), PALKINTO);
}
