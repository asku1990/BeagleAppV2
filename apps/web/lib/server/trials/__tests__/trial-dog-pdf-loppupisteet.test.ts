import type { PDFFont, PDFPage } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { drawTextMock } = vi.hoisted(() => ({
  drawTextMock: vi.fn(),
}));

vi.mock("../internal/koe-erat-common", async () => {
  const actual = await vi.importActual<
    typeof import("../internal/koe-erat-common")
  >("../internal/koe-erat-common");

  return {
    ...actual,
    drawText: drawTextMock,
  };
});

import { drawTrialDogPdfLoppuppisteet } from "../internal/loppupisteet";

describe("drawTrialDogPdfLoppuppisteet", () => {
  const page = {} as PDFPage;
  const font = {} as PDFFont;

  beforeEach(() => {
    drawTextMock.mockReset();
  });

  it("draws PALJAS_MAA marker", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: "PALJAS_MAA",
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(3);
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
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 12,
    });
  });

  it("draws LUMI marker", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: "LUMI",
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(3);
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
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 12,
    });
  });

  it("does not draw weather marker when value is null", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(2);
    expect(drawTextMock).toHaveBeenNthCalledWith(1, page, font, "12", {
      x: 357,
      y: 124.3,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 12,
    });
  });

  it("draws luopui, suljettu and keskeytetty markers", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: true,
      suljettu: true,
      keskeytetty: true,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(5);
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "X", {
      x: 107.5,
      y: 86,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "X", {
      x: 159.5,
      y: 86,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(4, page, font, "X", {
      x: 214.5,
      y: 86,
      size: 12,
    });
  });
});
