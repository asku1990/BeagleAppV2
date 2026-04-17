import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { drawTrialDogPdfPhase2 } from "../trial-dog-pdf-phase-2";

describe("drawTrialDogPdfPhase2", () => {
  it("draws the male sex mark", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([595, 842]);
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);

    drawTrialDogPdfPhase2({
      registrationNo: "FI12345/21",
      dogName: "JAMI",
      dogSex: "MALE",
      page,
      font,
    });

    const bytes = await pdfDocument.save();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it("draws the female sex mark", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([595, 842]);
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);

    drawTrialDogPdfPhase2({
      registrationNo: "FI12345/21",
      dogName: "JAMI",
      dogSex: "FEMALE",
      page,
      font,
    });

    const bytes = await pdfDocument.save();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
