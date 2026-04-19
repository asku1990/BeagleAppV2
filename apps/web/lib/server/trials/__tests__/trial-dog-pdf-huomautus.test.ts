import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { drawTrialDogPdfHuomautus } from "../internal/huomautus";

describe("drawTrialDogPdfHuomautus", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {
    widthOfTextAtSize: vi.fn(() => 10),
  } as unknown as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws the note in a sized block", () => {
    drawTrialDogPdfHuomautus({
      huomautusTeksti: "Tämä on huomautusteksti.",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "Tämä on huomautusteksti.",
      expect.objectContaining({
        x: 35.5,
        y: 68,
        size: 10,
        font,
        lineHeight: 16,
      }),
    );
  });

  it("skips empty notes", () => {
    drawTrialDogPdfHuomautus({
      huomautusTeksti: null,
      page,
      font,
    });

    expect(page.drawText).not.toHaveBeenCalled();
  });
});
