// Renders metsästysinto rows (40-41) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011OneDecimalLisatietoRows } from "./common";

const METSASTYSINTO_ROWS = [
  { koodi: "40", boxY: 294 },
  { koodi: "41", boxY: 274 },
];

export function drawLegacy2005To2011LisatiedotMetsastysinto(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  drawLegacy2005To2011OneDecimalLisatietoRows(input, METSASTYSINTO_ROWS);
}
