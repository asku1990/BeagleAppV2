import type { ImportIssueSeverity } from "@beagle/db";

export type CsvIssueRow = {
  stage: string;
  severity: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string | null;
  payloadJson: string | null;
};

function toCsvCell(value: string | null | undefined): string {
  const next = value ?? "";
  if (!/[",\n\r]/.test(next)) {
    return next;
  }
  return `"${next.replace(/"/g, '""')}"`;
}

export function toCsvLine(values: Array<string | null | undefined>): string {
  return values.map(toCsvCell).join(",");
}

// Keeps the review note first when per-code issue files are opened in Excel.
export function formatPerCodeIssueCsv(rows: CsvIssueRow[]): string {
  const lines = [
    toCsvLine([
      "message",
      "registrationNo",
      "sourceTable",
      "stage",
      "severity",
      "payloadJson",
    ]),
    ...rows.map((row) =>
      toCsvLine([
        row.message,
        row.registrationNo,
        row.sourceTable,
        row.stage,
        row.severity,
        row.payloadJson,
      ]),
    ),
  ];

  return `${lines.join("\n")}\n`;
}
