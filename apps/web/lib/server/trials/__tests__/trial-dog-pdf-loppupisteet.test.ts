import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { drawTextMock, formatKoeEraValueMock } = vi.hoisted(() => ({
  drawTextMock: vi.fn(),
  formatKoeEraValueMock: vi.fn(),
}));

vi.mock("../internal/koe-erat-common", () => ({
  drawText: drawTextMock,
  formatKoeEraValue: formatKoeEraValueMock,
}));

import { drawTrialDogPdfLoppuppisteet } from "../internal/loppupisteet";

describe("drawTrialDogPdfLoppuppisteet", () => {
  const page = {} as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    drawTextMock.mockReset();
    formatKoeEraValueMock.mockReset();
    formatKoeEraValueMock.mockReturnValue("12");
  });

  it("draws PALJAS_MAA marker", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: "PALJAS_MAA",
      page,
      font,
    });

    expect(formatKoeEraValueMock).toHaveBeenCalledWith(12);
    expect(drawTextMock).toHaveBeenCalledTimes(2);
    expect(drawTextMock).toHaveBeenNthCalledWith(1, page, font, "12", {
      x: 357,
      y: 124.3,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "X", {
      x: 37.5,
      y: 114.3,
      size: 12,
    });
  });

  it("draws LUMI marker", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: "LUMI",
      page,
      font,
    });

    expect(formatKoeEraValueMock).toHaveBeenCalledWith(12);
    expect(drawTextMock).toHaveBeenCalledTimes(2);
    expect(drawTextMock).toHaveBeenNthCalledWith(1, page, font, "12", {
      x: 357,
      y: 124.3,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "X", {
      x: 107.5,
      y: 114.3,
      size: 12,
    });
  });

  it("does not draw weather marker when value is null", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      page,
      font,
    });

    expect(formatKoeEraValueMock).toHaveBeenCalledWith(12);
    expect(drawTextMock).toHaveBeenCalledTimes(1);
    expect(drawTextMock).toHaveBeenNthCalledWith(1, page, font, "12", {
      x: 357,
      y: 124.3,
      size: 12,
    });
  });
});
