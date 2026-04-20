import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfLisatiedotAjo } from "../internal/lisatiedot/ajo";

describe("drawTrialDogPdfLisatiedotAjo", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders ajo 50-56 with one-decimal formatting", () => {
    drawTrialDogPdfLisatiedotAjo({
      lisatiedotRows: [
        { koodi: "50", era1: "2.00", era2: "0.00" },
        { koodi: "51", era1: "3.00", era2: "0.00" },
        { koodi: "52", era1: "3.00", era2: "0.00" },
        { koodi: "53", era1: "2.00", era2: "0.00" },
        { koodi: "54", era1: "6.00", era2: "0.00" },
        { koodi: "55", era1: "0.00", era2: "0.00" },
        { koodi: "56", era1: "5.00", era2: "0.00" },
      ],
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(14);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "2.0", {
      x: 782,
      y: 431.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "0.0", {
      x: 799,
      y: 431.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "3.0", {
      x: 782,
      y: 417.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "0.0", {
      x: 799,
      y: 417.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "3.0", {
      x: 782,
      y: 403.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "0.0", {
      x: 799,
      y: 403.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(7, "2.0", {
      x: 782,
      y: 389.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(8, "0.0", {
      x: 799,
      y: 389.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(9, "6.0", {
      x: 782,
      y: 375.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(10, "0.0", {
      x: 799,
      y: 375.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(11, "0.0", {
      x: 782,
      y: 361.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(12, "0.0", {
      x: 799,
      y: 361.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(13, "5.0", {
      x: 782,
      y: 347.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(14, "0.0", {
      x: 799,
      y: 347.5,
      size: 10,
      font,
      color: expect.any(Object),
    });
  });
});
