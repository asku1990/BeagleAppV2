import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders haukku rows (30-36) from lisätiedot onto fixed PDF coordinates.
// Rows 30-35 show one decimal; row 36 shows the raw integer value.
const HAUKKU_ERA1_X = 590;
const HAUKKU_ERA2_X = 607;
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

function normalizeIntegerValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  return value === "-" ? "" : value;
}

function normalizeOneDecimalValue(raw: string | null | undefined): string {
  const value = formatKoeEraValue(raw).trim();
  if (value === "-") {
    return "";
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed.toFixed(1) : value;
}

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
        ? normalizeOneDecimalValue(row?.era1)
        : normalizeIntegerValue(row?.era1);
    const era2 =
      rowConfig.kind === "ONE_DECIMAL"
        ? normalizeOneDecimalValue(row?.era2)
        : normalizeIntegerValue(row?.era2);

    if (era1) {
      drawText(input.page, input.font, era1, {
        x: HAUKKU_ERA1_X,
        y: rowConfig.y,
        size: HAUKKU_TEXT_SIZE,
      });
    }

    if (era2) {
      drawText(input.page, input.font, era2, {
        x: HAUKKU_ERA2_X,
        y: rowConfig.y,
        size: HAUKKU_TEXT_SIZE,
      });
    }
  }
}
