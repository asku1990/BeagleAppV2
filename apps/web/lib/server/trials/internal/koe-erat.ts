import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

const ERA1_ALKOI_VALUE_FIELD = {
  x: 142,
  y: 322.3,
  size: 12,
} as const;

const ERA2_ALKOI_VALUE_FIELD = {
  x: 215,
  y: 322.3,
  size: 12,
} as const;

const HAKU_MIN1_VALUE_FIELD = {
  x: 147,
  y: 305.3,
  size: 12,
} as const;

const HAKU_MIN2_VALUE_FIELD = {
  x: 221,
  y: 305.3,
  size: 12,
} as const;

const AJO_MIN1_VALUE_FIELD = {
  x: 147,
  y: 285.3,
  size: 12,
} as const;

const AJO_MIN2_VALUE_FIELD = {
  x: 221,
  y: 285.3,
  size: 12,
} as const;

const ACCEPTED_MINUTES_VALUE_FIELD = {
  x: 293,
  y: 305.3,
  size: 12,
} as const;

const AJOAJAN_PISTEET_VALUE_FIELD = {
  x: 357,
  y: 305.3,
  size: 12,
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

export function drawTrialDogPdfKoeErat(input: {
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
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
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuMin1),
    HAKU_MIN1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuMin2),
    HAKU_MIN2_VALUE_FIELD,
  );
  drawText(page, font, formatKoeEraValue(input.ajoMin1), AJO_MIN1_VALUE_FIELD);
  drawText(page, font, formatKoeEraValue(input.ajoMin2), AJO_MIN2_VALUE_FIELD);
  drawText(
    page,
    font,
    formatKoeEraValue(input.hyvaksytytAjominuutit),
    ACCEPTED_MINUTES_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajoajanPisteet),
    AJOAJAN_PISTEET_VALUE_FIELD,
  );
}
