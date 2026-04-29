// Renders haku rows (20-22) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011CenteredText } from "../core";

const ERA1_BOX_X = 515;
const ERA2_BOX_X = 543;
const BOX_WIDTH = 27;
const BOX_HEIGHT = 20;
const TEXT_SIZE = 12;

type HakuRowConfig = {
  koodi: string;
  boxY: number;
};

const HAKU_ROWS: HakuRowConfig[] = [
  { koodi: "20", boxY: 534 },
  { koodi: "21", boxY: 514 },
  { koodi: "22", boxY: 494 },
];

function normalizeOneDecimalValue(raw: string | null | undefined): string {
  const value = String(raw ?? "").trim();
  if (!value || value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1).replace(".", ",") : value;
}

export function drawLegacy2005To2011LisatiedotHaku(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of HAKU_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeOneDecimalValue(row?.era1);
    const era2 = normalizeOneDecimalValue(row?.era2);

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
