import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";

// Muut ominaisuudet group (60-61). Reserved for future row rendering.
export function drawTrialDogPdfLisatiedotMuutOminaisuudet(
  _input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  return;
}
