import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfMarkerValue,
} from "./common";

// Renders olosuhteet rows (11-18) from lisätiedot onto fixed PDF coordinates.
// Marker rows show X for true (1/X); numeric rows show their raw number values.
const OLOSUHDE_TEXT_SIZE = 12;
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

function normalizeRowValue(
  kind: OlosuhdeRowKind,
  raw: string | null | undefined,
): string {
  return kind === "NUMBER"
    ? normalizeTrialDogPdfIntegerValue(raw)
    : normalizeTrialDogPdfMarkerValue(raw);
}

// Olosuhteet group (11-18). Renders marker rows and numeric rows on fixed positions.
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
    const isNumeric = rowConfig.kind === "NUMBER";
    const y = isNumeric && rowConfig.koodi === "12" ? LUMIKELI_Y : rowConfig.y;

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "LEFT",
      era: 1,
      y,
      size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      leftCellKind: isNumeric ? "NUMERIC" : "MARKER",
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "LEFT",
      era: 2,
      y,
      size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      leftCellKind: isNumeric ? "NUMERIC" : "MARKER",
    });
  }
}
