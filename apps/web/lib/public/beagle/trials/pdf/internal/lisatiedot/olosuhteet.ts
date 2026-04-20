import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders olosuhteet rows (11-18) from lisätiedot onto fixed PDF coordinates.
// Marker rows show X for true (1/X); numeric rows show their raw number values.
const OLOSUHDE_ERA1_X = 592;
const OLOSUHDE_ERA2_X = 609;
const OLOSUHDE_TEXT_SIZE = 12;
const NUMERIC_ERA1_X = 591;
const NUMERIC_ERA2_X = 608;
const NUMERIC_TEXT_SIZE = 10;
const LUMIKELI_Y = 474.5;

type OlosuhdeRowKind = "MARKER" | "NUMBER";

type OlosuhdeRowConfig = {
  koodi: string;
  y: number;
  kind: OlosuhdeRowKind;
};

const OLOSUHDE_ROWS: OlosuhdeRowConfig[] = [
  { koodi: "11", y: 487.5, kind: "MARKER" },
  { koodi: "12", y: 473.5, kind: "NUMBER" },
  { koodi: "13", y: 459.5, kind: "MARKER" },
  { koodi: "14", y: 445.5, kind: "MARKER" },
  { koodi: "15", y: 430.5, kind: "MARKER" },
  { koodi: "16", y: 416.5, kind: "MARKER" },
  { koodi: "17", y: 402.5, kind: "NUMBER" },
  { koodi: "18", y: 388.5, kind: "NUMBER" },
];

function normalizeMarkerValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim().toUpperCase();
  return value === "1" || value === "X" ? "X" : "";
}

function normalizeCentimeterValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  return value === "-" ? "" : value;
}

function normalizeRowValue(
  kind: OlosuhdeRowKind,
  raw: string | null | undefined,
): string {
  return kind === "NUMBER"
    ? normalizeCentimeterValue(raw)
    : normalizeMarkerValue(raw);
}

// Olosuhteet group (11-18). Currently draws only koodi 11.
export function drawTrialDogPdfLisatiedotOlosuhteet(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of OLOSUHDE_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 = normalizeRowValue(rowConfig.kind, row?.era1);
    const era2 = normalizeRowValue(rowConfig.kind, row?.era2);

    if (era1) {
      const isNumeric = rowConfig.kind === "NUMBER";
      drawText(input.page, input.font, era1, {
        x: isNumeric ? NUMERIC_ERA1_X : OLOSUHDE_ERA1_X,
        y: isNumeric && rowConfig.koodi === "12" ? LUMIKELI_Y : rowConfig.y,
        size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      });
    }

    if (era2) {
      const isNumeric = rowConfig.kind === "NUMBER";
      drawText(input.page, input.font, era2, {
        x: isNumeric ? NUMERIC_ERA2_X : OLOSUHDE_ERA2_X,
        y: isNumeric && rowConfig.koodi === "12" ? LUMIKELI_Y : rowConfig.y,
        size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      });
    }
  }
}
