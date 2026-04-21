import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLoppupisteet } from "@contracts";
import { drawText, formatKoeEraValue } from "./koe-erat-common";

const LOPPUPISTEET = {
  x: 357,
  y: 124.3,
  size: 12,
} as const;

const PALJAS_MAA_X_FIELD = {
  x: 37.5,
  y: 114.3,
  size: 12,
} as const;

const LUMI_X_FIELD = {
  x: 107.5,
  y: 114.3,
  size: 12,
} as const;

const LUOPUI_X_FIELD = {
  x: 107.5,
  y: 86,
  size: 12,
} as const;

const SULJETTU_X_FIELD = {
  x: 159.5,
  y: 86,
  size: 12,
} as const;

const KESKEYTETTY_X_FIELD = {
  x: 214.5,
  y: 86,
  size: 12,
} as const;

const SIJOITUS_FIELD = {
  x: 355.5,
  y: 106,
  size: 12,
} as const;

const KOIRIA_LUOKASSA_FIELD = {
  x: 382.5,
  y: 106,
  size: 12,
} as const;

const PALKINTO = {
  x: 220,
  y: 110.3,
  size: 14,
} as const;

export function drawTrialDogPdfLoppuppisteet(
  input: TrialDogPdfLoppupisteet & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;
  const sijoitus = input.kokokaudenkoe ? "-" : input.sijoitus;
  const koiriaLuokassa = input.kokokaudenkoe ? "KK" : input.koiriaLuokassa;

  drawText(page, font, formatKoeEraValue(input.loppupisteet), LOPPUPISTEET);

  if (input.paljasMaaTaiLumi === "PALJAS_MAA") {
    drawText(page, font, "X", PALJAS_MAA_X_FIELD);
  } else if (input.paljasMaaTaiLumi === "LUMI") {
    drawText(page, font, "X", LUMI_X_FIELD);
  }

  if (input.luopui) {
    drawText(page, font, "X", LUOPUI_X_FIELD);
  }

  if (input.suljettu) {
    drawText(page, font, "X", SULJETTU_X_FIELD);
  }

  if (input.keskeytetty) {
    drawText(page, font, "X", KESKEYTETTY_X_FIELD);
  }

  drawText(page, font, formatKoeEraValue(sijoitus), SIJOITUS_FIELD);

  drawText(
    page,
    font,
    formatKoeEraValue(koiriaLuokassa),
    KOIRIA_LUOKASSA_FIELD,
  );

  drawText(page, font, formatKoeEraValue(input.Palkinto), PALKINTO);
}
