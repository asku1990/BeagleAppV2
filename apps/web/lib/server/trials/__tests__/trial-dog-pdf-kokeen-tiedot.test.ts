import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { drawTrialDogPdfKokeenTiedot } from "../internal/kokeen-tiedot";

describe("drawTrialDogPdfKokeenTiedot", () => {
  it("draws the trial header block", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([595, 842]);
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);

    drawTrialDogPdfKokeenTiedot({
      kennelpiiri: "Kainuun kennelpiiri ry",
      kennelpiirinro: "3",
      koekunta: "Ristijärvi",
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjestaja: "Kainuun Ajokoirakerho",
      page,
      font,
    });

    const bytes = await pdfDocument.save();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
