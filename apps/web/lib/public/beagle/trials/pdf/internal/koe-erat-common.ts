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
