// Renders muut ominaisuudet rows (60-61) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011OneDecimalLisatietoRows } from "./common";

const MUUT_OMINAISUUDET_ROWS = [
  { koodi: "60", boxY: 79 },
  { koodi: "61", boxY: 59 },
];

export function drawLegacy2005To2011LisatiedotMuutOminaisuudet(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  drawLegacy2005To2011OneDecimalLisatietoRows(input, MUUT_OMINAISUUDET_ROWS);
}
