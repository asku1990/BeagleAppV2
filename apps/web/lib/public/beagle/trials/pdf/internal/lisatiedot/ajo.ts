import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders ajo rows (50-56) from lisätiedot onto fixed PDF coordinates.
// All rows use one decimal formatting.
const AJO_ERA1_X = 782;
const AJO_ERA2_X = 799;
const AJO_TEXT_SIZE = 10;

type AjoRowConfig = {
  koodi: string;
  y: number;
};

const AJO_ROWS: AjoRowConfig[] = [
  { koodi: "50", y: 431 },
  { koodi: "51", y: 417 },
  { koodi: "52", y: 403 },
  { koodi: "53", y: 389 },
  { koodi: "54", y: 375 },
  { koodi: "55", y: 361 },
  { koodi: "56", y: 347 },
];

function normalizeOneDecimalValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  if (value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1) : value;
}

export function drawTrialDogPdfLisatiedotAjo(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of AJO_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeOneDecimalValue(row?.era1);
    const era2 = normalizeOneDecimalValue(row?.era2);

    if (era1) {
      drawText(input.page, input.font, era1, {
        x: AJO_ERA1_X,
        y: rowConfig.y,
        size: AJO_TEXT_SIZE,
      });
    }

    if (era2) {
      drawText(input.page, input.font, era2, {
        x: AJO_ERA2_X,
        y: rowConfig.y,
        size: AJO_TEXT_SIZE,
      });
    }
  }
}
