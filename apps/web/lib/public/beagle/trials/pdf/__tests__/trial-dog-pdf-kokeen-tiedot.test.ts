import type { PDFFont, PDFPage } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";
import {
  JARJESTAJA_FIELD,
  KENNELPIIRI_FIELD,
  KENNELPIIRI_NRO_FIELD,
  KOEKUNTA_FIELD,
  KOEMAASTO_FIELD,
  KOEMAASTO_SEPARATOR_FIELD,
  KOEPAIVA_FIELD,
  drawTrialDogPdfKokeenTiedot,
} from "../internal/kokeen-tiedot";

describe("drawTrialDogPdfKokeenTiedot", () => {
  const page = {
    drawText: vi.fn(),
  } as unknown as PDFPage;
  const font = {} as PDFFont;

  it("draws koekunta and koemaasto in the original inline slot", () => {
    drawTrialDogPdfKokeenTiedot({
      kennelpiiri: "Kainuun kennelpiiri ry",
      kennelpiirinro: "3",
      koekunta: "Ristijärvi",
      koemaasto: "Ristijärvi",
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjestaja: "Kainuun Ajokoirakerho",
      page,
      font,
    });

    expect(page.drawText).toHaveBeenCalledTimes(7);
    expect(page.drawText).toHaveBeenNthCalledWith(1, "Kainuun kennelpiiri ry", {
      x: KENNELPIIRI_FIELD.x,
      y: KENNELPIIRI_FIELD.y,
      size: KENNELPIIRI_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(2, "3", {
      x: KENNELPIIRI_NRO_FIELD.x,
      y: KENNELPIIRI_NRO_FIELD.y,
      size: KENNELPIIRI_NRO_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(3, "Ristijärvi", {
      x: KOEKUNTA_FIELD.x,
      y: KOEKUNTA_FIELD.y,
      size: KOEKUNTA_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(4, "/", {
      x: KOEMAASTO_SEPARATOR_FIELD.x,
      y: KOEMAASTO_SEPARATOR_FIELD.y,
      size: KOEMAASTO_SEPARATOR_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(5, "Ristijärvi", {
      x: KOEMAASTO_FIELD.x,
      y: KOEMAASTO_FIELD.y,
      size: KOEMAASTO_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(6, "07.09.2025", {
      x: KOEPAIVA_FIELD.x,
      y: KOEPAIVA_FIELD.y,
      size: KOEPAIVA_FIELD.size,
      font,
      color: expect.any(Object),
    });
    expect(page.drawText).toHaveBeenNthCalledWith(7, "Kainuun Ajokoirakerho", {
      x: JARJESTAJA_FIELD.x,
      y: JARJESTAJA_FIELD.y,
      size: JARJESTAJA_FIELD.size,
      font,
      color: expect.any(Object),
    });
  });
});
