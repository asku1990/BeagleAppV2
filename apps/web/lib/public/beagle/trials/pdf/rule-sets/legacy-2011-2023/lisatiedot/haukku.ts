import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders haukku rows (30-36) from lisätiedot onto fixed PDF coordinates.
// Rows 30-35 show one decimal; row 36 shows the raw integer value.
const HAUKKU_TEXT_SIZE = 10;

type HaukkuRowKind = "ONE_DECIMAL" | "INTEGER";

type HaukkuRowConfig = {
  koodi: string;
  y: number;
  kind: HaukkuRowKind;
};

const HAUKKU_ROWS: HaukkuRowConfig[] = [
  { koodi: "30", y: 303.5, kind: "ONE_DECIMAL" },
  { koodi: "31", y: 289.5, kind: "ONE_DECIMAL" },
  { koodi: "32", y: 275.5, kind: "ONE_DECIMAL" },
  { koodi: "33", y: 261.5, kind: "ONE_DECIMAL" },
  { koodi: "34", y: 247.5, kind: "ONE_DECIMAL" },
  { koodi: "35", y: 233.5, kind: "ONE_DECIMAL" },
  { koodi: "36", y: 219.5, kind: "INTEGER" },
];

export function drawTrialDogPdfLisatiedotHaukku(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of HAUKKU_ROWS) {
    const row = rowsByCode.get(rowConfig.koodi);
    const era1 =
      rowConfig.kind === "ONE_DECIMAL"
        ? normalizeTrialDogPdfOneDecimalValue(row?.era1)
        : normalizeTrialDogPdfIntegerValue(row?.era1);
    const era2 =
      rowConfig.kind === "ONE_DECIMAL"
        ? normalizeTrialDogPdfOneDecimalValue(row?.era2)
        : normalizeTrialDogPdfIntegerValue(row?.era2);

    drawTrialDogPdfCenteredLisatietoValue(input, era1, {
      columnGroup: "LEFT",
      era: 1,
      y: rowConfig.y,
      size: HAUKKU_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "LEFT",
      era: 2,
      y: rowConfig.y,
      size: HAUKKU_TEXT_SIZE,
    });
  }
}
