import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotOlosuhteet } from "../internal/lisatiedot/olosuhteet";

describe("drawTrialDogPdfLisatiedotOlosuhteet", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders lisatieto 11 era values with separate coordinates", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [
        { koodi: "11", era1: "1", era2: null },
        { koodi: "12", era1: "5", era2: "7" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(2);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "X", {
      x: 592,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "", {
      x: 609,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
  });

  it("does not render when paljas maa marker is missing", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [{ koodi: "11", era1: null, era2: null }],
      page,
      font,
    });

    expect(page.drawText).not.toHaveBeenCalled();
  });

  it("renders empty text for zero marker values", () => {
    drawTrialDogPdfLisatiedotOlosuhteet({
      lisatiedotRows: [{ koodi: "11", era1: "1", era2: "0" }],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenNthCalledWith(1, "X", {
      x: 592,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "", {
      x: 609,
      y: 487.5,
      size: 12,
      font,
      color: expect.any(Object),
    });
  });
});
