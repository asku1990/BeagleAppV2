import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import {
  drawTrialDogPdfCenteredLisatietoValue,
  normalizeTrialDogPdfIntegerValue,
  normalizeTrialDogPdfOneDecimalValue,
} from "./common";

// Renders haku rows (20-22) from lisätiedot onto fixed PDF coordinates.
// Row 20 shows the raw integer value; rows 21 and 22 show one decimal.
const HAKU_TEXT_SIZE = 10;

type HakuRowKind = "INTEGER" | "ONE_DECIMAL";

type HakuRowConfig = {
  koodi: string;
  y: number;
  kind: HakuRowKind;
};

const HAKU_ROWS: HakuRowConfig[] = [
  { koodi: "20", y: 360.5, kind: "INTEGER" },
  { koodi: "21", y: 346.5, kind: "ONE_DECIMAL" },
  { koodi: "22", y: 332.5, kind: "ONE_DECIMAL" },
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
