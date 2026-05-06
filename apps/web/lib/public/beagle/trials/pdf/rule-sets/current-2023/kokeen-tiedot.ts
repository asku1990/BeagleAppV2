import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfKokeenTiedot } from "@contracts";

export const KENNELPIIRI_FIELD = {
  x: 110,
  y: 510.5,
  size: 12,
} as const;

export const KENNELPIIRI_NRO_FIELD = {
  x: 353,
  y: 510,
  size: 12,
} as const;

const KOEKUNTA_KOEMAASTO_BOX = {
  x: 110,
  y: 490,
  width: 235,
  size: 12,
} as const;

export const KOEKUNTA_FIELD = {
  x: KOEKUNTA_KOEMAASTO_BOX.x,
  y: KOEKUNTA_KOEMAASTO_BOX.y,
  size: KOEKUNTA_KOEMAASTO_BOX.size,
} as const;

export const KOEMAASTO_FIELD = {
  x: KOEKUNTA_KOEMAASTO_BOX.x,
  y: KOEKUNTA_KOEMAASTO_BOX.y,
  size: KOEKUNTA_KOEMAASTO_BOX.size,
} as const;

export const KOEPAIVA_FIELD = {
  x: 290,
  y: 490,
  size: 12,
} as const;

export const JARJESTAJA_FIELD = {
  x: 110,
  y: 471,
  size: 12,
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

function drawMergedInlineText(
  page: PDFPage,
  font: PDFFont,
  left: string | null | undefined,
  right: string | null | undefined,
): void {
  const parts = [left?.trim(), right?.trim()].filter((value): value is string =>
    Boolean(value),
  );

  if (parts.length === 0) {
    return;
  }

  const text = parts.join(" / ");
  const size = fitTextSize(
    font,
    text,
    KOEKUNTA_KOEMAASTO_BOX.size,
    KOEKUNTA_KOEMAASTO_BOX.width,
  );

  page.drawText(text, {
    x: KOEKUNTA_KOEMAASTO_BOX.x,
    y: KOEKUNTA_KOEMAASTO_BOX.y,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function formatTrialDate(value: Date): string {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function drawTrialDogPdfKokeenTiedot(
  input: TrialDogPdfKokeenTiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  if (input.kennelpiiri) {
    page.drawText(input.kennelpiiri, {
      x: KENNELPIIRI_FIELD.x,
      y: KENNELPIIRI_FIELD.y,
      size: KENNELPIIRI_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (input.kennelpiirinro) {
    page.drawText(input.kennelpiirinro, {
      x: KENNELPIIRI_NRO_FIELD.x,
      y: KENNELPIIRI_NRO_FIELD.y,
      size: KENNELPIIRI_NRO_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  drawMergedInlineText(page, font, input.koekunta, input.koemaasto);

  if (input.koepaiva) {
    page.drawText(formatTrialDate(input.koepaiva), {
      x: KOEPAIVA_FIELD.x,
      y: KOEPAIVA_FIELD.y,
      size: KOEPAIVA_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (input.jarjestaja) {
    page.drawText(input.jarjestaja, {
      x: JARJESTAJA_FIELD.x,
      y: JARJESTAJA_FIELD.y,
      size: JARJESTAJA_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}
