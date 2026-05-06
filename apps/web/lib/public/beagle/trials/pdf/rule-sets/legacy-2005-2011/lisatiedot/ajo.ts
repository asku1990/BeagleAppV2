// Renders ajo rows (50-56) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011OneDecimalLisatietoRows } from "./common";

const AJO_ROWS = [
  { koodi: "50", boxY: 233 },
  { koodi: "51", boxY: 213 },
  { koodi: "52", boxY: 193 },
  { koodi: "53", boxY: 173 },
  { koodi: "54", boxY: 153 },
  { koodi: "55", boxY: 133 },
  { koodi: "56", boxY: 113 },
];

export function drawLegacy2005To2011LisatiedotAjo(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  drawLegacy2005To2011OneDecimalLisatietoRows(input, AJO_ROWS);
}
