import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";

// Ajo group (50-56). Reserved for future row rendering.
export function drawTrialDogPdfLisatiedotAjo(
  _input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  return;
}
