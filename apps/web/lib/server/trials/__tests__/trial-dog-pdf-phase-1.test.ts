import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { drawTrialDogPdfPhase1 } from "../trial-dog-pdf-phase-1";

describe("drawTrialDogPdfPhase1", () => {
  it("draws the trial header block", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([595, 842]);
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);

    drawTrialDogPdfPhase1({
      kennelpiiri: "Kainuun kennelpiiri ry",
      kennelpiirinro: "3",
      koekunta: "Ristijärvi",
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjeastaja: "Kainuun Ajokoirakerho",
      page,
      font,
    });

    const bytes = await pdfDocument.save();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
