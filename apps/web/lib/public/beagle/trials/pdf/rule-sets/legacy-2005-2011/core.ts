import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export type Legacy2005To2011PdfField = {
  x: number;
  y: number;
  size: number;
};

export type Legacy2005To2011PdfBox = Legacy2005To2011PdfField & {
  width: number;
  height: number;
};

export function drawLegacy2005To2011Text(
  page: PDFPage,
  font: PDFFont,
  value: string | number | boolean | null | undefined,
  field: Legacy2005To2011PdfField,
): void {
  const text = formatLegacy2005To2011Value(value);
  if (!text) return;

  page.drawText(text, {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function drawLegacy2005To2011CenteredText(
  page: PDFPage,
  font: PDFFont,
  value: string | number | boolean | null | undefined,
  box: Legacy2005To2011PdfBox,
): void {
  const text = formatLegacy2005To2011Value(value);
  if (!text) return;

  const textWidth = font.widthOfTextAtSize(text, box.size);
  const textHeight = font.heightAtSize(box.size);

  page.drawText(text, {
    x: box.x + (box.width - textWidth) / 2,
    y: box.y + (box.height - textHeight) / 2,
    size: box.size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function formatLegacy2005To2011Date(date: Date): string {
  return `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`;
}

export function formatLegacy2005To2011Score(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) return "";
  return value.toFixed(2).replace(".", ",");
}

function formatLegacy2005To2011Value(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "X" : "";

  const text = String(value).trim();
  return text.length > 0 ? text : "";
}
