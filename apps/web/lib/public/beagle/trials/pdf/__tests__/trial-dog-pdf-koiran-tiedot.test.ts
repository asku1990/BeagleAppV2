import { PDFDocument, StandardFonts } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { drawTrialDogPdfKoiranTiedot } from "../rule-sets/legacy-2011-2023/koiran-tiedot";

describe("drawTrialDogPdfKoiranTiedot", () => {
  it("draws the trial dog details block", async () => {
    const pdfDocument = await PDFDocument.create();
    const page = pdfDocument.addPage([595, 842]);
    const font = await pdfDocument.embedFont(StandardFonts.Helvetica);

    drawTrialDogPdfKoiranTiedot({
      registrationNo: "FI12345/21",
      dogName: "JAMI",
      dogSex: "MALE",
      page,
      font,
    });

    const bytes = await pdfDocument.save();

    expect(bytes.byteLength).toBeGreaterThan(0);
  });
});
