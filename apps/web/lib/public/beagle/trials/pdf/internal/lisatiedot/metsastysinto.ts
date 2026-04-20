import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders metsästysinto rows (40-42) from lisätiedot onto fixed PDF coordinates.
// All three rows use one decimal formatting.
const METSASTYSINTO_ERA1_X = 782;
const METSASTYSINTO_ERA2_X = 799;
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

function normalizeOneDecimalValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  if (value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1) : value;
}

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
    const era1 = normalizeOneDecimalValue(row?.era1);
    const era2 = normalizeOneDecimalValue(row?.era2);

    if (era1) {
      drawText(input.page, input.font, era1, {
        x: METSASTYSINTO_ERA1_X,
        y: rowConfig.y,
        size: METSASTYSINTO_TEXT_SIZE,
      });
    }

    if (era2) {
      drawText(input.page, input.font, era2, {
        x: METSASTYSINTO_ERA2_X,
        y: rowConfig.y,
        size: METSASTYSINTO_TEXT_SIZE,
      });
    }
  }
}
