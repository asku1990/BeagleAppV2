import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders metsästysinto rows (40-42) from lisätiedot onto fixed PDF coordinates.
// All three rows use one decimal formatting.
const METSASTYSINTO_TEXT_SIZE = 10;

type MetsastysintoRowConfig = {
  koodi: string;
  y: number;
};

const METSASTYSINTO_ROWS: MetsastysintoRowConfig[] = [
  { koodi: "40", y: 487.5 },
  { koodi: "41", y: 473.5 },
  { koodi: "42", y: 459.5 },
];

export function drawTrialDogPdfLisatiedotMetsastysinto(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of METSASTYSINTO_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeTrialDogPdfOneDecimalValue(row?.era1);
    const era2 = normalizeTrialDogPdfOneDecimalValue(row?.era2);

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "RIGHT",
      era: 1,
      y: rowConfig.y,
      size: METSASTYSINTO_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "RIGHT",
      era: 2,
      y: rowConfig.y,
      size: METSASTYSINTO_TEXT_SIZE,
    });
  }
}
