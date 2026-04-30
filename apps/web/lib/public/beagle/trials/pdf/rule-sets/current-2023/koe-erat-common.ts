import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export function drawText(
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

export function drawCenteredText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  box: { x: number; y: number; width: number; height: number; size: number },
): void {
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

export function formatKoeEraValue(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return "-";
    }

    const parts = trimmed.split(":");
    if (parts.length === 2) {
      const [hours, minutes] = parts;
      const normalizedHours = hours.padStart(2, "0");
      const normalizedMinutes = minutes.padStart(2, "0");
      return `${normalizedHours}:${normalizedMinutes}`;
    }

    return trimmed;
  }

  return String(value);
}
