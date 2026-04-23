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
      koetyyppi: "NORMAL",
      sijoitus: "1",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(5);
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
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(4, page, font, "2", {
      x: 382.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(5, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 14,
    });
  });

  it("draws LUMI marker", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: "LUMI",
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: "1",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(5);
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
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(4, page, font, "2", {
      x: 382.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(5, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 14,
    });
  });

  it("does not draw weather marker when value is null", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: "1",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(4);
    expect(drawTextMock).toHaveBeenNthCalledWith(1, page, font, "12", {
      x: 357,
      y: 124.3,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "1", {
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "2", {
      x: 382.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(4, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 14,
    });
  });

  it("draws luopui, suljettu and keskeytetty markers", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: true,
      suljettu: true,
      keskeytetty: true,
      koetyyppi: "NORMAL",
      sijoitus: "1",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(7);
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
    expect(drawTextMock).toHaveBeenNthCalledWith(5, page, font, "1", {
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(6, page, font, "2", {
      x: 382.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(7, page, font, "1", {
      x: 220,
      y: 110.3,
      size: 14,
    });
  });

  it("renders dash for empty sijoitus", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: "",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(4);
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "-", {
      x: 355.5,
      y: 106,
      size: 12,
    });
  });

  it("renders KOKOKAUDENKOE as dash and KK", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "KOKOKAUDENKOE",
      sijoitus: "1",
      koiriaLuokassa: 2,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(4);
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "-", {
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "KK", {
      x: 382.5,
      y: 106,
      size: 12,
    });
  });

  it("renders PITKAKOE as PK and class count", () => {
    drawTrialDogPdfLoppuppisteet({
      loppupisteet: 12,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "PITKAKOE",
      sijoitus: "1",
      koiriaLuokassa: 4,
      Palkinto: "1",
      page,
      font,
    });

    expect(drawTextMock).toHaveBeenCalledTimes(4);
    expect(drawTextMock).toHaveBeenNthCalledWith(2, page, font, "PK", {
      x: 355.5,
      y: 106,
      size: 12,
    });
    expect(drawTextMock).toHaveBeenNthCalledWith(3, page, font, "4", {
      x: 382.5,
      y: 106,
      size: 12,
    });
  });
});
