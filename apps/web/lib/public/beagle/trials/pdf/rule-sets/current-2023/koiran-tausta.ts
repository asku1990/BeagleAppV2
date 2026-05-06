import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { TrialDogPdfKoiranTausta } from "@contracts";

const SIRE_NAME_FIELD = {
  x: 115,
  y: 403,
  size: 12,
} as const;

const SIRE_REGISTRATION_NO_FIELD = {
  x: 323,
  y: 403,
  size: 12,
} as const;

const DAM_NAME_FIELD = {
  x: 115,
  y: 382,
  size: 12,
} as const;

const DAM_REGISTRATION_NO_FIELD = {
  x: 323,
  y: 382,
  size: 12,
} as const;

const OWNER_FIELD = {
  x: 115,
  y: 363,
  size: 12,
} as const;

const OWNER_HOME_MUNICIPALITY_FIELD = {
  x: 323,
  y: 363,
  size: 12,
} as const;

function drawText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  field: { x: number; y: number; size: number },
): void {
  page.drawText(text, {
    x: field.x,
    y: field.y,
    size: field.size,
    font,
    color: rgb(0, 0, 0),
  });
}

export function drawTrialDogPdfKoiranTausta(
  input: TrialDogPdfKoiranTausta & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  if (input.sireName) {
    drawText(page, font, input.sireName, SIRE_NAME_FIELD);
  }

  if (input.sireRegistrationNo) {
    drawText(page, font, input.sireRegistrationNo, SIRE_REGISTRATION_NO_FIELD);
  }

  if (input.damName) {
    drawText(page, font, input.damName, DAM_NAME_FIELD);
  }

  if (input.damRegistrationNo) {
    drawText(page, font, input.damRegistrationNo, DAM_REGISTRATION_NO_FIELD);
  }

  if (input.omistaja) {
    drawText(page, font, input.omistaja, OWNER_FIELD);
  }

  if (input.omistajanKotikunta) {
    drawText(
      page,
      font,
      input.omistajanKotikunta,
      OWNER_HOME_MUNICIPALITY_FIELD,
    );
  }
}
