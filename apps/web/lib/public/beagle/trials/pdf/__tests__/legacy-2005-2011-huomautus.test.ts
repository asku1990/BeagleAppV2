import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_2005_2011_HUOMAUTUS_BLOCK,
  drawLegacy2005To2011Huomautus,
} from "../rule-sets/legacy-2005-2011/huomautus";

describe("drawLegacy2005To2011Huomautus", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {
    widthOfTextAtSize: vi.fn(() => 10),
  } as unknown as PDFFont;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws the note in the 2005-2011 sized block", () => {
    drawLegacy2005To2011Huomautus({
      huomautusTeksti: "Tämä on huomautusteksti.",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledWith(
      "Tämä on huomautusteksti.",
      expect.objectContaining({
        x: LEGACY_2005_2011_HUOMAUTUS_BLOCK.x,
        y: LEGACY_2005_2011_HUOMAUTUS_BLOCK.y,
        size: LEGACY_2005_2011_HUOMAUTUS_BLOCK.size,
        font,
        lineHeight: LEGACY_2005_2011_HUOMAUTUS_BLOCK.lineHeight,
      }),
    );
  });

  it("skips empty notes", () => {
    drawLegacy2005To2011Huomautus({
      huomautusTeksti: null,
      page,
      font,
    });

    expect(page.drawText).not.toHaveBeenCalled();
  });
});
