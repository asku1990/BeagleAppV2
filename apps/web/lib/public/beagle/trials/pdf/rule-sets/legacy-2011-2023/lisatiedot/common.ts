// Shared helpers for centering AJOK 2011-2023 lisätiedot values in their PDF cells.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawCenteredText, formatKoeEraValue } from "../koe-erat-common";

const CELL_WIDTH = 17;
const CELL_HEIGHT = 12;
const BASELINE_OFFSET_Y = 2;

// The 2011-2023 template has two lisätiedot tables:
// - left table: olosuhteet, haku, and haukku
// - right table: metsästysinto, ajo, and muut ominaisuudet
//
// X values are the left edges of the small era value cells. Olosuhteet marker
// cells are printed one point to the right in the template compared to numeric
// left-table cells, so marker and numeric origins are kept separate.
const LEFT_GROUP_NUMERIC_ERA1_X = 588;
const LEFT_GROUP_NUMERIC_ERA2_X = 605;
const LEFT_GROUP_MARKER_ERA1_X = 587;
const LEFT_GROUP_MARKER_ERA2_X = 605;
const RIGHT_GROUP_ERA1_X = 780;
const RIGHT_GROUP_ERA2_X = 797.5;

export type TrialDogPdfLisatiedotInput = TrialDogPdfLisatiedot & {
  page: PDFPage;
  font: PDFFont;
};

export type TrialDogPdfLisatietoColumnGroup = "LEFT" | "RIGHT";
export type TrialDogPdfLisatietoLeftCellKind = "NUMERIC" | "MARKER";

export function normalizeTrialDogPdfIntegerValue(
  raw: string | null | undefined,
): string {
  const value = formatKoeEraValue(raw).trim();
  return value === "-" ? "" : value;
}

export function normalizeTrialDogPdfOneDecimalValue(
  raw: string | null | undefined,
): string {
  const value = formatKoeEraValue(raw).trim();
  if (value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1) : value;
}

export function normalizeTrialDogPdfMarkerValue(
  raw: string | null | undefined,
): string {
  const value = formatKoeEraValue(raw).trim().toUpperCase();
  return value === "1" || value === "X" ? "X" : "";
}

export function drawTrialDogPdfCenteredLisatietoValue(
  input: TrialDogPdfLisatiedotInput,
  value: string,
  field: {
    columnGroup: TrialDogPdfLisatietoColumnGroup;
    era: 1 | 2;
    y: number;
    size: number;
    leftCellKind?: TrialDogPdfLisatietoLeftCellKind;
  },
): void {
  if (!value) return;

  drawCenteredText(input.page, input.font, value, {
    x: getCellX(field),
    y: field.y - BASELINE_OFFSET_Y,
    width: CELL_WIDTH,
    height: CELL_HEIGHT,
    size: field.size,
  });
}

function getCellX(field: {
  columnGroup: TrialDogPdfLisatietoColumnGroup;
  era: 1 | 2;
  leftCellKind?: TrialDogPdfLisatietoLeftCellKind;
}): number {
  if (field.columnGroup === "RIGHT") {
    return field.era === 1 ? RIGHT_GROUP_ERA1_X : RIGHT_GROUP_ERA2_X;
  }

  if (field.leftCellKind === "MARKER") {
    return field.era === 1
      ? LEFT_GROUP_MARKER_ERA1_X
      : LEFT_GROUP_MARKER_ERA2_X;
  }

  return field.era === 1
    ? LEFT_GROUP_NUMERIC_ERA1_X
    : LEFT_GROUP_NUMERIC_ERA2_X;
}
