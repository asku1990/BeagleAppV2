import type { TrialDogPdfKoiranTiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011Text } from "./core";

export const LEGACY_2005_2011_DOG_REGISTRATION_NO_FIELD = {
  x: 140,
  y: 700,
  size: 12,
} as const;

export const LEGACY_2005_2011_DOG_NAME_FIELD = {
  x: 110,
  y: 720,
  size: 12,
} as const;

export const LEGACY_2005_2011_DOG_SEX_UROS_FIELD = {
  x: 85,
  y: 679,
  size: 9,
} as const;

export const LEGACY_2005_2011_DOG_SEX_NARTTU_FIELD = {
  x: 164,
  y: 679,
  size: 9,
} as const;

export function drawLegacy2005To2011KoiranTiedot(
  input: TrialDogPdfKoiranTiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011Text(
    page,
    font,
    input.registrationNo,
    LEGACY_2005_2011_DOG_REGISTRATION_NO_FIELD,
  );
  drawLegacy2005To2011Text(
    page,
    font,
    input.dogName,
    LEGACY_2005_2011_DOG_NAME_FIELD,
  );

  if (input.dogSex === "MALE") {
    drawLegacy2005To2011Text(
      page,
      font,
      true,
      LEGACY_2005_2011_DOG_SEX_UROS_FIELD,
    );
  } else if (input.dogSex === "FEMALE") {
    drawLegacy2005To2011Text(
      page,
      font,
      true,
      LEGACY_2005_2011_DOG_SEX_NARTTU_FIELD,
    );
  }
}
