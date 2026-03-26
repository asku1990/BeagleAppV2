const WORKBOOK_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const SHOW_WORKBOOK_ACCEPT = `.xlsx,${WORKBOOK_MIME_TYPE}`;

export function isShowWorkbookFile(file: File): boolean {
  const normalizedName = file.name.trim().toLowerCase();

  return normalizedName.endsWith(".xlsx") || file.type === WORKBOOK_MIME_TYPE;
}

export function formatShowWorkbookFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kib = bytes / 1024;
  if (kib < 1024) {
    return `${kib.toFixed(kib < 10 ? 1 : 0)} KiB`;
  }

  const mib = kib / 1024;
  return `${mib.toFixed(mib < 10 ? 1 : 0)} MiB`;
}
