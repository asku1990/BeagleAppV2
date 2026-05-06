// Renders haku rows (20-22) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011OneDecimalLisatietoRows } from "./common";

const HAKU_ROWS = [
  { koodi: "20", boxY: 534 },
  { koodi: "21", boxY: 514 },
  { koodi: "22", boxY: 494 },
];

export function drawLegacy2005To2011LisatiedotHaku(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  drawLegacy2005To2011OneDecimalLisatietoRows(input, HAKU_ROWS);
}
