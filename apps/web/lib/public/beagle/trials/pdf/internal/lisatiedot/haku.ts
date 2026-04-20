import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";

// Haku group (20-22). Reserved for future row rendering.
export function drawTrialDogPdfLisatiedotHaku(
  _input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  return;
}
