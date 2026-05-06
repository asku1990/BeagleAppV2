// Renders haukku rows (30-36) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011OneDecimalLisatietoRows } from "./common";

const HAUKKU_ROWS = [
  { koodi: "30", boxY: 454 },
  { koodi: "31", boxY: 434 },
  { koodi: "32", boxY: 414 },
  { koodi: "33", boxY: 394 },
  { koodi: "34", boxY: 374 },
  { koodi: "35", boxY: 354 },
  { koodi: "36", boxY: 334 },
];

export function drawLegacy2005To2011LisatiedotHaukku(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  drawLegacy2005To2011OneDecimalLisatietoRows(input, HAUKKU_ROWS);
}
