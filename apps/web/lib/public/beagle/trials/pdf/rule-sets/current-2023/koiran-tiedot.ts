import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfKoiranTiedot } from "@contracts";

export const DOG_REGISTRATION_NO_FIELD = {
  x: 300.3,
  y: 433,
  size: 12,
} as const;

export const DOG_NAME_FIELD = {
  x: 70,
  y: 433,
  size: 12,
} as const;

export const DOG_SEX_UROS_FIELD = {
  x: 38.7,
  y: 459.5,
  size: 12,
} as const;

export const DOG_SEX_NARTTU_FIELD = {
  x: 131,
  y: 459.5,
  size: 12,
} as const;

export function drawTrialDogPdfKoiranTiedot(
  input: TrialDogPdfKoiranTiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  page.drawText(input.registrationNo, {
    x: DOG_REGISTRATION_NO_FIELD.x,
    y: DOG_REGISTRATION_NO_FIELD.y,
    size: DOG_REGISTRATION_NO_FIELD.size,
    font,
    color: rgb(0, 0, 0),
  });

  if (input.dogName) {
    page.drawText(input.dogName, {
      x: DOG_NAME_FIELD.x,
      y: DOG_NAME_FIELD.y,
      size: DOG_NAME_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  if (input.dogSex === "MALE") {
    page.drawText("X", {
      x: DOG_SEX_UROS_FIELD.x,
      y: DOG_SEX_UROS_FIELD.y,
      size: DOG_SEX_UROS_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  } else if (input.dogSex === "FEMALE") {
    page.drawText("X", {
      x: DOG_SEX_NARTTU_FIELD.x,
      y: DOG_SEX_NARTTU_FIELD.y,
      size: DOG_SEX_NARTTU_FIELD.size,
      font,
      color: rgb(0, 0, 0),
    });
  }
}
