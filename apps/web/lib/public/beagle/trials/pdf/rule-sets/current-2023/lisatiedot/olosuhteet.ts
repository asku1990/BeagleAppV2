import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfMarkerValue,
} from "./common";

// Renders olosuhteet rows (10-19) from lisätiedot onto fixed PDF coordinates.
// Marker rows show X for true (1/X); numeric rows show their raw number values.
const OLOSUHDE_TEXT_SIZE = 10;
const NUMERIC_TEXT_SIZE = 9;

type OlosuhdeRowKind = "MARKER" | "NUMBER";

type OlosuhdeRowConfig = {
  koodi: string;
  y: number;
  kind: OlosuhdeRowKind;
};

const OLOSUHDE_ROWS: OlosuhdeRowConfig[] = [
  { koodi: "10", y: 487.5, kind: "MARKER" },
  { koodi: "11", y: 475.5, kind: "MARKER" },
  { koodi: "12", y: 462.5, kind: "NUMBER" },
  { koodi: "13", y: 450.5, kind: "MARKER" },
  { koodi: "14", y: 437.5, kind: "MARKER" },
  { koodi: "15", y: 424.5, kind: "MARKER" },
  { koodi: "16", y: 411.5, kind: "MARKER" },
  { koodi: "17", y: 398.5, kind: "NUMBER" },
  { koodi: "18", y: 385.5, kind: "NUMBER" },
  { koodi: "19", y: 373.5, kind: "NUMBER" },
];

function normalizeRowValue(
  kind: OlosuhdeRowKind,
  raw: string | null | undefined,
): string {
  return kind === "NUMBER"
    ? normalizeTrialDogPdfIntegerValue(raw)
    : normalizeTrialDogPdfMarkerValue(raw);
}

// Olosuhteet group (10-19). Renders marker rows and numeric rows on fixed positions.
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

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "LEFT",
      era: 1,
      y: rowConfig.y,
      size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      leftCellKind: isNumeric ? "NUMERIC" : "MARKER",
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "LEFT",
      era: 2,
      y: rowConfig.y,
      size: isNumeric ? NUMERIC_TEXT_SIZE : OLOSUHDE_TEXT_SIZE,
      leftCellKind: isNumeric ? "NUMERIC" : "MARKER",
    });
  }
}
