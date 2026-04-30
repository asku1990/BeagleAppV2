// Renders olosuhteet rows (11-18) for the AJOK 2005-2011 PDF.
// Coordinates are intentionally local so the template fit can be tuned in one place.
import type { TrialDogPdfLisatiedot } from "@contracts";
import type { PDFFont, PDFPage } from "pdf-lib";
import { drawLegacy2005To2011CenteredText } from "../core";

const ERA1_BOX_X = 515;
const ERA2_BOX_X = 543;
const BOX_WIDTH = 27;
const BOX_HEIGHT = 20;
const MARKER_SIZE = 12;
const NUMBER_SIZE = 12;

type OlosuhdeRowKind = "MARKER" | "NUMBER";

type OlosuhdeRowConfig = {
  koodi: string;
  boxY: number;
  kind: OlosuhdeRowKind;
  decimals?: number;
};

const OLOSUHDE_ROWS: OlosuhdeRowConfig[] = [
  { koodi: "11", boxY: 713, kind: "MARKER" },
  { koodi: "12", boxY: 693, kind: "NUMBER" },
  { koodi: "13", boxY: 672, kind: "MARKER" },
  { koodi: "14", boxY: 652, kind: "MARKER" },
  { koodi: "15", boxY: 632, kind: "MARKER" },
  { koodi: "16", boxY: 612, kind: "MARKER" },
  { koodi: "17", boxY: 593, kind: "NUMBER" },
  { koodi: "18", boxY: 573, kind: "NUMBER", decimals: 1 },
];

function normalizeMarkerValue(raw: string | null | undefined): string {
  const value = String(raw ?? "")
    .trim()
    .toUpperCase();
  return value === "1" || value === "X" ? "X" : "";
}

function normalizeNumberValue(
  raw: string | null | undefined,
  decimals?: number,
): string {
  const value = String(raw ?? "").trim();
  if (!value || value === "-") {
    return "";
  }

  if (decimals === undefined) {
    return value;
  }

  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed)
    ? parsed.toFixed(decimals).replace(".", ",")
    : value;
}

function normalizeRowValue(
  rowConfig: OlosuhdeRowConfig,
  raw: string | null | undefined,
): string {
  return rowConfig.kind === "NUMBER"
    ? normalizeNumberValue(raw, rowConfig.decimals)
    : normalizeMarkerValue(raw);
}

export function drawLegacy2005To2011LisatiedotOlosuhteet(
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
    const era1 = normalizeRowValue(rowConfig, row?.era1);
    const era2 = normalizeRowValue(rowConfig, row?.era2);
    const isNumeric = rowConfig.kind === "NUMBER";

    drawLegacy2005To2011CenteredText(input.page, input.font, era1, {
      x: ERA1_BOX_X,
      y: rowConfig.boxY,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      size: isNumeric ? NUMBER_SIZE : MARKER_SIZE,
    });

    drawLegacy2005To2011CenteredText(input.page, input.font, era2, {
      x: ERA2_BOX_X,
      y: rowConfig.boxY,
      width: BOX_WIDTH,
      height: BOX_HEIGHT,
      size: isNumeric ? NUMBER_SIZE : MARKER_SIZE,
    });
  }
}
