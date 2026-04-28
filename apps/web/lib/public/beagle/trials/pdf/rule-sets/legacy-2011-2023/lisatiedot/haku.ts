import type { PDFFont, PDFPage } from "pdf-lib";
import type { TrialDogPdfLisatiedot } from "@contracts";
import { drawText, formatKoeEraValue } from "../koe-erat-common";

// Renders haku rows (20-22) from lisätiedot onto fixed PDF coordinates.
// Row 20 shows the raw integer value; rows 21 and 22 show one decimal.
const HAKU_ERA1_X = 590;
const HAKU_ERA2_X = 607;
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
        ? normalizeOneDecimalValue(row?.era1)
        : normalizeIntegerValue(row?.era1);
    const era2 =
      rowConfig.kind === "ONE_DECIMAL"
        ? normalizeOneDecimalValue(row?.era2)
        : normalizeIntegerValue(row?.era2);

    if (era1) {
      drawText(input.page, input.font, era1, {
        x: HAKU_ERA1_X,
        y: rowConfig.y,
        size: HAKU_TEXT_SIZE,
      });
    }

    if (era2) {
      drawText(input.page, input.font, era2, {
        x: HAKU_ERA2_X,
        y: rowConfig.y,
        size: HAKU_TEXT_SIZE,
      });
    }
  }
}
