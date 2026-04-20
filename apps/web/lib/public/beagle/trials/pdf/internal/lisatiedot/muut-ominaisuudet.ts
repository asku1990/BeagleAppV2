import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders muut ominaisuudet rows (60-61) from lisätiedot onto fixed PDF coordinates.
// Both rows use one decimal formatting.
const MUUT_OMINAISUUDET_ERA1_X = 782;
const MUUT_OMINAISUUDET_ERA2_X = 799;
const MUUT_OMINAISUUDET_TEXT_SIZE = 10;

type MuutOminaisuudetRowConfig = {
  koodi: string;
  y: number;
};

const MUUT_OMINAISUUDET_ROWS: MuutOminaisuudetRowConfig[] = [
  { koodi: "60", y: 303.5 },
  { koodi: "61", y: 289.5 },
];

function normalizeOneDecimalValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  if (value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1) : value;
}

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
    const era1 = normalizeOneDecimalValue(row?.era1);
    const era2 = normalizeOneDecimalValue(row?.era2);

    if (era1) {
      drawText(input.page, input.font, era1, {
        x: MUUT_OMINAISUUDET_ERA1_X,
        y: rowConfig.y,
        size: MUUT_OMINAISUUDET_TEXT_SIZE,
      });
    }

    if (era2) {
      drawText(input.page, input.font, era2, {
        x: MUUT_OMINAISUUDET_ERA2_X,
        y: rowConfig.y,
        size: MUUT_OMINAISUUDET_TEXT_SIZE,
      });
    }
  }
}
