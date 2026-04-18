import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

const ERA1_ALKOI_VALUE_FIELD = {
  x: 200,
  y: 293.3,
  size: 10,
} as const;

const ERA2_ALKOI_VALUE_FIELD = {
  x: 283,
  y: 293.3,
  size: 10,
} as const;

function drawText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  field: { x: number; y: number; size: number },
): void {
  page.drawText(text, {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0, 0, 0),
  });
}

function formatKoeEraValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : "-";
  }

  return String(value);
}

export function drawTrialDogPdfKoeErat(input: {
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  page: PDFPage;
  font: PDFFont;
}): void {
  const { page, font } = input;

  drawText(
    page,
    font,
    formatKoeEraValue(input.era1Alkoi),
    ERA1_ALKOI_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.era2Alkoi),
    ERA2_ALKOI_VALUE_FIELD,
  );
}
