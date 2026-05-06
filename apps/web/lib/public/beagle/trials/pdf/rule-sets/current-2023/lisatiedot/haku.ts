import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders haku rows (20-27) from lisätiedot onto fixed PDF coordinates.
const HAKU_TEXT_SIZE = 9;

type HakuRowKind = "INTEGER" | "ONE_DECIMAL";

type HakuRowConfig = {
  koodi: string;
  y: number;
  kind: HakuRowKind;
};

const HAKU_ROWS: HakuRowConfig[] = [
  { koodi: "20", y: 346.5, kind: "INTEGER" },
  { koodi: "21", y: 333.5, kind: "ONE_DECIMAL" },
  { koodi: "22", y: 321.5, kind: "ONE_DECIMAL" },
  { koodi: "23", y: 307.5, kind: "ONE_DECIMAL" },
  { koodi: "24", y: 295.5, kind: "ONE_DECIMAL" },
  { koodi: "25", y: 282.5, kind: "ONE_DECIMAL" },
  { koodi: "26", y: 269.5, kind: "ONE_DECIMAL" },
  { koodi: "27", y: 256.5, kind: "INTEGER" },
];

export function drawTrialDogPdfLisatiedotHaku(
  input: TrialDogPdfLisatiedot & {
    page: PDFPage;
    font: PDFFont;
  },
): void {
  const rowsByCode = new Map(
    (input.lisatiedotRows ?? []).map((row) => [row.koodi, row]),
  );

  for (const rowConfig of HAKU_ROWS) {
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
      size: HAKU_TEXT_SIZE,
    });
    drawTrialDogPdfCenteredLisatietoValue(input, era2, {
      columnGroup: "LEFT",
      era: 2,
      y: rowConfig.y,
      size: HAKU_TEXT_SIZE,
    });
  }
}
