import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export const KENNELPIIRI_FIELD = {
  x: 62.3,
  y: 526.5,
  size: 12,
} as const;

export const KENNELPIIRI_NRO_FIELD = {
  x: 343,
  y: 526.5,
  size: 12,
} as const;

export const KOEKUNTA_FIELD = {
  x: 62.3,
  y: 504,
  size: 12,
} as const;

export const KOEPAIVA_FIELD = {
  x: 258,
  y: 504,
  size: 12,
} as const;

export const JARJESTAJA_FIELD = {
  x: 62.3,
  y: 481,
  size: 12,
} as const;

function formatTrialDate(value: Date): string {
  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function drawTrialDogPdfKokeenTiedot(input: {
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  koekunta: string | null;
  koepaiva: Date;
  jarjeastaja: string | null;
  page: PDFPage;
  font: PDFFont;
}): void {
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

  // koemaasto will be added later when schema changes are done.
  if (input.koekunta) {
    page.drawText(`${input.koekunta}\\koemaasto`, {
      x: KOEKUNTA_FIELD.x,
      y: KOEKUNTA_FIELD.y,
      size: KOEKUNTA_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (input.koepaiva) {
    page.drawText(formatTrialDate(input.koepaiva), {
      x: KOEPAIVA_FIELD.x,
      y: KOEPAIVA_FIELD.y,
      size: KOEPAIVA_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (input.jarjeastaja) {
    page.drawText(input.jarjeastaja, {
      x: JARJESTAJA_FIELD.x,
      y: JARJESTAJA_FIELD.y,
      size: JARJESTAJA_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}
