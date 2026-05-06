import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011CenteredText } from "../core";

const ERA1_BOX_X = 515;
const ERA2_BOX_X = 543;
const BOX_WIDTH = 27;
const BOX_HEIGHT = 20;
const TEXT_SIZE = 12;

export type Legacy2005To2011LisatietoRowConfig = {
  koodi: string;
  boxY: number;
};

export function normalizeLegacy2005To2011OneDecimalValue(
  raw: string | null | undefined,
): string {
  const value = String(raw ?? "").trim();
  if (!value || value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1).replace(".", ",") : value;
}

export function drawLegacy2005To2011OneDecimalLisatietoRows(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
  rows: Legacy2005To2011LisatietoRowConfig[],
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of rows) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeLegacy2005To2011OneDecimalValue(row?.era1);
    const era2 = normalizeLegacy2005To2011OneDecimalValue(row?.era2);

    drawLegacy2005To2011CenteredText(input.page, input.font, era1, {
      x: ERA1_BOX_X,
      y: rowConfig.boxY,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      size: TEXT_SIZE,
    });

    drawLegacy2005To2011CenteredText(input.page, input.font, era2, {
      x: ERA2_BOX_X,
      y: rowConfig.boxY,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      size: TEXT_SIZE,
    });
  }
}
