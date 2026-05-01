import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders ajo rows (50-56) from lisätiedot onto fixed PDF coordinates.
// All rows use one decimal formatting.
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
    const era1 = normalizeTrialDogPdfOneDecimalValue(row?.era1);
    const era2 = normalizeTrialDogPdfOneDecimalValue(row?.era2);

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "RIGHT",
      era: 1,
      y: rowConfig.y,
      size: AJO_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "RIGHT",
      era: 2,
      y: rowConfig.y,
      size: AJO_TEXT_SIZE,
    });
  }
}
