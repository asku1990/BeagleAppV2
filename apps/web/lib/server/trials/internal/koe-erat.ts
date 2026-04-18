import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfKoeErat } from "@contracts";

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

const HYVAKSYTYT_AJOMINUUTIT_FIELD = {
  x: 286,
  y: 305.3,
  size: 12,
} as const;

const AJOAJAN_PISTEET_VALUE_FIELD = {
  x: 357,
  y: 305.3,
  size: 12,
} as const;

const HAKU_ERA1_VALUE_FIELD = {
  x: 147,
  y: 243.3,
  size: 12,
} as const;

const HAKUKESKIARVO_VALUE_FIELD = {
  x: 286,
  y: 243.3,
  size: 12,
} as const;

const HAKU_ERA2_VALUE_FIELD = {
  x: 221,
  y: 243.3,
  size: 12,
} as const;

const HAUKKU_ERA1_VALUE_FIELD = {
  x: 147,
  y: 223.3,
  size: 12,
} as const;

const HAUKKU_ERA2_VALUE_FIELD = {
  x: 221,
  y: 223.3,
  size: 12,
} as const;

const HAUKKUESKIARVO_VALUE_FIELD = {
  x: 286,
  y: 223.3,
  size: 12,
} as const;

const AJOTAITO_ERA1_VALUE_FIELD = {
  x: 147,
  y: 203.3,
  size: 12,
} as const;

const AJOTAITO_ERA2_VALUE_FIELD = {
  x: 221,
  y: 203.3,
  size: 12,
} as const;

const AJOTAITOKESKIARVO_VALUE_FIELD = {
  x: 286,
  y: 203.3,
  size: 12,
} as const;

const ANSIOPISTEET_VALUE_FIELD = {
  x: 357,
  y: 223.3,
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

export function drawTrialDogPdfKoeErat(
  input: TrialDogPdfKoeErat & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
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
    HYVAKSYTYT_AJOMINUUTIT_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajoajanPisteet),
    AJOAJAN_PISTEET_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuEra1),
    HAKU_ERA1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuEra2),
    HAKU_ERA2_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.hakuKeskiarvo),
    HAKUKESKIARVO_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.haukkuEra1),
    HAUKKU_ERA1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.haukkuEra2),
    HAUKKU_ERA2_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.haukkuKeskiarvo),
    HAUKKUESKIARVO_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajotaitoEra1),
    AJOTAITO_ERA1_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajotaitoEra2),
    AJOTAITO_ERA2_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ajotaitoKeskiarvo),
    AJOTAITOKESKIARVO_VALUE_FIELD,
  );
  drawText(
    page,
    font,
    formatKoeEraValue(input.ansiopisteetYhteensa),
    ANSIOPISTEET_VALUE_FIELD,
  );
}
