import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfAnsiopisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

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

// Renders the AJOK scoring and average fields.
type AnsiopisteetInput = TrialDogPdfAnsiopisteet & {
  page: PDFPage;
  font: PDFFont;
};

export function drawTrialDogPdfAnsiopisteet(input: AnsiopisteetInput): void {
  const { page, font } = input;

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
