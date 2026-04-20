import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";

// Haukku group (30-36). Reserved for future row rendering.
export function drawTrialDogPdfLisatiedotHaukku(
  _input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  return;
}
