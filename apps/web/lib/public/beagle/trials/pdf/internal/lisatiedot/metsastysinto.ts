import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";

// Metsästysinto group (40-42). Reserved for future row rendering.
export function drawTrialDogPdfLisatiedotMetsastysinto(
  _input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  return;
}
