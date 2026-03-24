// Formats public beagle show search/detail rows into TSV output and
// centralizes clipboard write and toast handling for show pages.
import type {
  BeagleDogProfileShowRowDto,
  BeagleShowDetailsRow,
  BeagleShowSearchRow,
} from "@beagle/contracts";
import {
  formatClassCode,
  formatClassPlacement,
  formatQualityGrade,
  formatResultNotes,
  formatShowType,
} from "./result-display";

type ShowSearchClipboardLabels = {
  date: string;
  place: string;
  judge: string;
  dogCount: string;
};

type ShowDetailClipboardLabels = {
  registrationNo: string;
  name: string;
  sex: string;
  showType: string;
  className: string;
  qualityGrade: string;
  placement: string;
  resultNotes: string;
  reviewText: string;
  height: string;
  judge: string;
  sexMale: string;
  sexFemale: string;
  sexUnknown: string;
};

type ShowDetailClipboardColumns = {
  includeShowType?: boolean;
  includeClassName?: boolean;
  includeQualityGrade?: boolean;
  includeClassPlacement?: boolean;
  includePupn?: boolean;
  includeAwards?: boolean;
  includeHeight?: boolean;
  includeJudge?: boolean;
  includeReviewText?: boolean;
};

type ShowDetailClipboardRow = BeagleShowDetailsRow;

type DogProfileShowClipboardLabels = {
  no: string;
  showType: string;
  className: string;
  place: string;
  date: string;
  qualityGrade: string;
  placement: string;
  resultNotes: string;
  reviewText: string;
  height: string;
  judge: string;
};

type DogProfileShowClipboardColumns = {
  includeShowType: boolean;
  includeClassName: boolean;
  includeQualityGrade: boolean;
  includeClassPlacement: boolean;
  includePupn: boolean;
  includeAwards: boolean;
  includeReviewText: boolean;
  includeHeight: boolean;
  includeJudge: boolean;
};

type ClipboardMessages = {
  success: string;
  error: string;
  unsupported: string;
};

type ClipboardLike = {
  writeText: (text: string) => Promise<void>;
};

type ClipboardToastHandlers = {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
};

function sanitizeCell(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formatMaybeString(value: string | null | undefined): string {
  return value?.trim() ? value : "-";
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return "-";
  }

  return `${heightCm} cm`;
}

function formatSex(
  sex: ShowDetailClipboardRow["sex"],
  labels: Pick<
    ShowDetailClipboardLabels,
    "sexMale" | "sexFemale" | "sexUnknown"
  >,
): string {
  if (sex === "U") return labels.sexMale;
  if (sex === "N") return labels.sexFemale;
  return labels.sexUnknown;
}

function resolveShowDetailClipboardColumns(
  columns?: ShowDetailClipboardColumns,
): Required<ShowDetailClipboardColumns> {
  return {
    includeShowType: columns?.includeShowType ?? true,
    includeClassName: columns?.includeClassName ?? true,
    includeQualityGrade: columns?.includeQualityGrade ?? true,
    includeClassPlacement: columns?.includeClassPlacement ?? true,
    includePupn: columns?.includePupn ?? true,
    includeAwards: columns?.includeAwards ?? true,
    includeHeight: columns?.includeHeight ?? true,
    includeJudge: columns?.includeJudge ?? true,
    includeReviewText: columns?.includeReviewText ?? true,
  };
}

export function formatShowSearchRowsForClipboard(
  rows: BeagleShowSearchRow[],
  labels: ShowSearchClipboardLabels,
): string {
  if (rows.length === 0) return "";

  const header = [labels.date, labels.place, labels.judge, labels.dogCount];
  const body = rows.map((row) => [
    row.eventDate,
    row.eventPlace,
    formatMaybeString(row.judge),
    String(row.dogCount),
  ]);

  return [header, ...body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatShowDetailRowForClipboard(
  row: ShowDetailClipboardRow,
  labels: ShowDetailClipboardLabels,
  columns?: ShowDetailClipboardColumns,
): string {
  const visibleColumns = resolveShowDetailClipboardColumns(columns);
  const header = [labels.registrationNo, labels.name, labels.sex];
  const body = [row.registrationNo, row.name, formatSex(row.sex, labels)];

  if (visibleColumns.includeShowType) {
    header.push(labels.showType);
    body.push(formatShowType(row));
  }
  if (visibleColumns.includeQualityGrade) {
    header.push(labels.qualityGrade);
    body.push(formatQualityGrade(row));
  }
  if (visibleColumns.includeClassName) {
    header.push(labels.className);
    body.push(formatClassCode(row));
  }
  if (visibleColumns.includeClassPlacement) {
    header.push(labels.placement);
    body.push(formatClassPlacement(row));
  }
  if (visibleColumns.includePupn || visibleColumns.includeAwards) {
    header.push(labels.resultNotes);
    body.push(formatResultNotes(row));
  }
  if (visibleColumns.includeHeight) {
    header.push(labels.height);
    body.push(formatHeight(row.heightCm));
  }
  if (visibleColumns.includeJudge) {
    header.push(labels.judge);
    body.push(formatMaybeString(row.judge));
  }
  if (visibleColumns.includeReviewText) {
    header.push(labels.reviewText);
    body.push(formatMaybeString(row.critiqueText));
  }

  return [header, body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatShowDetailRowsForClipboard(
  rows: ShowDetailClipboardRow[],
  labels: ShowDetailClipboardLabels,
  columns?: ShowDetailClipboardColumns,
): string {
  if (rows.length === 0) return "";

  const visibleColumns = resolveShowDetailClipboardColumns(columns);
  const header = [labels.registrationNo, labels.name, labels.sex];
  if (visibleColumns.includeShowType) header.push(labels.showType);
  if (visibleColumns.includeQualityGrade) header.push(labels.qualityGrade);
  if (visibleColumns.includeClassName) header.push(labels.className);
  if (visibleColumns.includeClassPlacement) header.push(labels.placement);
  if (visibleColumns.includePupn || visibleColumns.includeAwards) {
    header.push(labels.resultNotes);
  }
  if (visibleColumns.includeHeight) header.push(labels.height);
  if (visibleColumns.includeJudge) header.push(labels.judge);
  if (visibleColumns.includeReviewText) header.push(labels.reviewText);

  const body = rows.map((row) => {
    const cells = [row.registrationNo, row.name, formatSex(row.sex, labels)];

    if (visibleColumns.includeShowType) cells.push(formatShowType(row));
    if (visibleColumns.includeQualityGrade) cells.push(formatQualityGrade(row));
    if (visibleColumns.includeClassName) cells.push(formatClassCode(row));
    if (visibleColumns.includeClassPlacement) {
      cells.push(formatClassPlacement(row));
    }
    if (visibleColumns.includePupn || visibleColumns.includeAwards) {
      cells.push(formatResultNotes(row));
    }
    if (visibleColumns.includeHeight) cells.push(formatHeight(row.heightCm));
    if (visibleColumns.includeJudge) cells.push(formatMaybeString(row.judge));
    if (visibleColumns.includeReviewText) {
      cells.push(formatMaybeString(row.critiqueText));
    }
    return cells;
  });

  return [header, ...body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatDogProfileShowRowsForClipboard(
  rows: BeagleDogProfileShowRowDto[],
  labels: DogProfileShowClipboardLabels,
  columns: DogProfileShowClipboardColumns,
): string {
  if (rows.length === 0) return "";

  const header = [labels.no];
  if (columns.includeShowType) header.push(labels.showType);
  header.push(labels.place, labels.date);
  if (columns.includeQualityGrade) header.push(labels.qualityGrade);
  if (columns.includeClassName) header.push(labels.className);
  if (columns.includeClassPlacement) header.push(labels.placement);
  if (columns.includePupn || columns.includeAwards) {
    header.push(labels.resultNotes);
  }
  if (columns.includeHeight) header.push(labels.height);
  if (columns.includeJudge) header.push(labels.judge);
  if (columns.includeReviewText) header.push(labels.reviewText);

  const body = rows.map((row, index) => {
    const cells = [String(index + 1)];
    if (columns.includeShowType) cells.push(formatShowType(row));
    cells.push(row.place, row.date);
    if (columns.includeQualityGrade) cells.push(formatQualityGrade(row));
    if (columns.includeClassName) cells.push(formatClassCode(row));
    if (columns.includeClassPlacement) cells.push(formatClassPlacement(row));
    if (columns.includePupn || columns.includeAwards) {
      cells.push(formatResultNotes(row));
    }
    if (columns.includeHeight) cells.push(formatHeight(row.heightCm));
    if (columns.includeJudge) cells.push(formatMaybeString(row.judge));
    if (columns.includeReviewText) {
      cells.push(formatMaybeString(row.critiqueText));
    }
    return cells;
  });

  return [header, ...body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

async function writeClipboardOutput({
  output,
  clipboard,
  messages,
  toast,
}: {
  output: string;
  clipboard: ClipboardLike | undefined;
  messages: ClipboardMessages;
  toast: ClipboardToastHandlers;
}) {
  if (!clipboard?.writeText) {
    toast.warning(messages.unsupported);
    return false;
  }

  try {
    await clipboard.writeText(output);
    toast.success(messages.success);
    return true;
  } catch {
    toast.error(messages.error);
    return false;
  }
}

export async function copyShowSearchRowsToClipboard({
  rows,
  labels,
  messages,
  clipboard,
  toast,
}: {
  rows: BeagleShowSearchRow[];
  labels: ShowSearchClipboardLabels;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatShowSearchRowsForClipboard(rows, labels),
    clipboard,
    messages,
    toast,
  });
}

export async function copyShowDetailRowToClipboard({
  row,
  labels,
  columns,
  messages,
  clipboard,
  toast,
}: {
  row: ShowDetailClipboardRow;
  labels: ShowDetailClipboardLabels;
  columns?: ShowDetailClipboardColumns;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  return writeClipboardOutput({
    output: formatShowDetailRowForClipboard(row, labels, columns),
    clipboard,
    messages,
    toast,
  });
}

export async function copyShowDetailRowsToClipboard({
  rows,
  labels,
  columns,
  messages,
  clipboard,
  toast,
}: {
  rows: ShowDetailClipboardRow[];
  labels: ShowDetailClipboardLabels;
  columns?: ShowDetailClipboardColumns;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatShowDetailRowsForClipboard(rows, labels, columns),
    clipboard,
    messages,
    toast,
  });
}

export async function copyDogProfileShowRowsToClipboard({
  rows,
  labels,
  columns,
  messages,
  clipboard,
  toast,
}: {
  rows: BeagleDogProfileShowRowDto[];
  labels: DogProfileShowClipboardLabels;
  columns: DogProfileShowClipboardColumns;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatDogProfileShowRowsForClipboard(rows, labels, columns),
    clipboard,
    messages,
    toast,
  });
}
