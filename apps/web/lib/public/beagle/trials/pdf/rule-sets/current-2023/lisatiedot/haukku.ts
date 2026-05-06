import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfOneDecimalValue,
  type TrialDogPdfLisatietoColumnGroup,
} from "./common";

// Renders haukku rows onto fixed PDF coordinates. In the 2023 template rows
// 30-34 are in the left table and rows 35-37 are in the right table.
const HAUKKU_TEXT_SIZE = 9;

type HaukkuRowKind = "ONE_DECIMAL" | "INTEGER";

type HaukkuRowConfig = {
  koodi: string;
  y: number;
  kind: HaukkuRowKind;
  columnGroup: TrialDogPdfLisatietoColumnGroup;
};

const HAUKKU_ROWS: HaukkuRowConfig[] = [
  { koodi: "30", y: 223.5, kind: "ONE_DECIMAL", columnGroup: "LEFT" },
  { koodi: "31", y: 210.5, kind: "ONE_DECIMAL", columnGroup: "LEFT" },
  { koodi: "32", y: 197.5, kind: "ONE_DECIMAL", columnGroup: "LEFT" },
  { koodi: "33", y: 184.5, kind: "ONE_DECIMAL", columnGroup: "LEFT" },
  { koodi: "34", y: 170.5, kind: "ONE_DECIMAL", columnGroup: "LEFT" },
  { koodi: "35", y: 472.5, kind: "ONE_DECIMAL", columnGroup: "RIGHT" },
  { koodi: "36", y: 459.5, kind: "INTEGER", columnGroup: "RIGHT" },
  { koodi: "37", y: 445.5, kind: "ONE_DECIMAL", columnGroup: "RIGHT" },
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
      columnGroup: rowConfig.columnGroup,
      era: 1,
      y: rowConfig.y,
      size: HAUKKU_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: rowConfig.columnGroup,
      era: 2,
      y: rowConfig.y,
      size: HAUKKU_TEXT_SIZE,
    });
  }
}
