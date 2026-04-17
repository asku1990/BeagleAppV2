import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export const DOG_REGISTRATION_NO_FIELD = {
  x: 286.3,
  y: 433,
  size: 12,
} as const;

export const DOG_NAME_FIELD = {
  x: 62.3,
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

type TrialDogSex = "MALE" | "FEMALE" | "UNKNOWN" | null;

function drawMark(
  page: PDFPage,
  font: PDFFont,
  field: { x: number; y: number; size: number },
): void {
  page.drawText("X", {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function drawTrialDogPdfPhase2(input: {
  registrationNo: string;
  dogName: string | null;
  dogSex: TrialDogSex;
  page: PDFPage;
  font: PDFFont;
}): void {
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
    drawMark(page, font, DOG_SEX_UROS_FIELD);
  } else if (input.dogSex === "FEMALE") {
    drawMark(page, font, DOG_SEX_NARTTU_FIELD);
  }
}
