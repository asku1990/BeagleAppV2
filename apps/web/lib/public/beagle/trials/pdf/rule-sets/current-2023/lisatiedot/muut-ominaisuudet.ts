import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders muut ominaisuudet rows (60-61) from lisätiedot onto fixed PDF coordinates.
// Both rows use one decimal formatting.
const MUUT_OMINAISUUDET_TEXT_SIZE = 10;

type MuutOminaisuudetRowConfig = {
  koodi: string;
  y: number;
};

const MUUT_OMINAISUUDET_ROWS: MuutOminaisuudetRowConfig[] = [
  { koodi: "60", y: 303.5 },
  { koodi: "61", y: 289.5 },
];

export function drawTrialDogPdfLisatiedotMuutOminaisuudet(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of MUUT_OMINAISUUDET_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeTrialDogPdfOneDecimalValue(row?.era1);
    const era2 = normalizeTrialDogPdfOneDecimalValue(row?.era2);

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "RIGHT",
      era: 1,
      y: rowConfig.y,
      size: MUUT_OMINAISUUDET_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "RIGHT",
      era: 2,
      y: rowConfig.y,
      size: MUUT_OMINAISUUDET_TEXT_SIZE,
    });
  }
}
