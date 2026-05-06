import type { TrialDogPdfKoiranTausta } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011Text } from "./core";

const LEGACY_2005_2011_SIRE_NAME_FIELD = {
  x: 85,
  y: 658,
  size: 12,
} as const;

const LEGACY_2005_2011_SIRE_REGISTRATION_NO_FIELD = {
  x: 300,
  y: 658,
  size: 12,
} as const;

const LEGACY_2005_2011_DAM_NAME_FIELD = {
  x: 85,
  y: 638,
  size: 12,
} as const;

const LEGACY_2005_2011_DAM_REGISTRATION_NO_FIELD = {
  x: 300,
  y: 638,
  size: 12,
} as const;

/* const LEGACY_2005_2011_OWNER_FIELD = {
  x: 62.3,
  y: 362.3,
  size: 12,
} as const; */

/* const LEGACY_2005_2011_OWNER_HOME_MUNICIPALITY_FIELD = {
  x: 286.3,
  y: 361.9682,
  size: 12,
} as const; */

export function drawLegacy2005To2011KoiranTausta(
  input: TrialDogPdfKoiranTausta & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const { page, font } = input;

  drawLegacy2005To2011Text(
    page,
    font,
    input.sireName,
    LEGACY_2005_2011_SIRE_NAME_FIELD,
  );
  drawLegacy2005To2011Text(
    page,
    font,
    input.sireRegistrationNo,
    LEGACY_2005_2011_SIRE_REGISTRATION_NO_FIELD,
  );
  drawLegacy2005To2011Text(
    page,
    font,
    input.damName,
    LEGACY_2005_2011_DAM_NAME_FIELD,
  );
  drawLegacy2005To2011Text(
    page,
    font,
    input.damRegistrationNo,
    LEGACY_2005_2011_DAM_REGISTRATION_NO_FIELD,
  );
  /*   drawLegacy2005To2011Text(
    page,
    font,
    input.omistaja,
    LEGACY_2005_2011_OWNER_FIELD,
  );
  drawLegacy2005To2011Text(
    page,
    font,
    input.omistajanKotikunta,
    LEGACY_2005_2011_OWNER_HOME_MUNICIPALITY_FIELD,
  ); */
}
