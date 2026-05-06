import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders ajo rows (50-59) from lisätiedot onto fixed PDF coordinates.
// Row 58 is minutes, so it is rendered without decimals.
const AJO_TEXT_SIZE = 9;

type AjoRowConfig = {
  koodi: string;
  y: number;
};

const AJO_ROWS: AjoRowConfig[] = [
  { koodi: "50", y: 360 },
  { koodi: "51", y: 347 },
  { koodi: "52", y: 334 },
  { koodi: "53", y: 322 },
  { koodi: "54", y: 309 },
  { koodi: "55", y: 296 },
  { koodi: "56", y: 283 },
  { koodi: "57", y: 270 },
  { koodi: "58", y: 257 },
  { koodi: "59", y: 245 },
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
    const normalizeValue =
      rowConfig.koodi === "58"
        ? normalizeTrialDogPdfIntegerValue
        : normalizeTrialDogPdfOneDecimalValue;
    const era1 = normalizeValue(row?.era1);
    const era2 = normalizeValue(row?.era2);

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
