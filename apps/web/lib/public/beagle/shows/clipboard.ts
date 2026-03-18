// Formats public beagle show search/detail rows into TSV output and
// centralizes clipboard write and toast handling for show pages.
import type {
  BeagleDogProfileShowRowDto,
  BeagleShowDetailsRow,
  BeagleShowSearchRow,
} from "@beagle/contracts";
import {
  formatAwards,
  formatClassCode,
  formatClassPlacement,
  formatPupn,
  formatQualityGrade,
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
  pupn: string;
  awards: string;
  reviewText: string;
  height: string;
  judge: string;
  sexMale: string;
  sexFemale: string;
  sexUnknown: string;
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
  pupn: string;
  awards: string;
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
): string {
  const header = [
    labels.registrationNo,
    labels.name,
    labels.sex,
    labels.showType,
    labels.className,
    labels.qualityGrade,
    labels.placement,
    labels.pupn,
    labels.awards,
    labels.reviewText,
    labels.height,
    labels.judge,
  ];
  const body = [
    row.registrationNo,
    row.name,
    formatSex(row.sex, labels),
    formatShowType(row),
    formatClassCode(row),
    formatQualityGrade(row),
    formatClassPlacement(row),
    formatPupn(row),
    formatAwards(row),
    formatMaybeString(row.critiqueText),
    formatHeight(row.heightCm),
    formatMaybeString(row.judge),
  ];

  return [header, body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatShowDetailRowsForClipboard(
  rows: ShowDetailClipboardRow[],
  labels: ShowDetailClipboardLabels,
): string {
  if (rows.length === 0) return "";

  const header = [
    labels.registrationNo,
    labels.name,
    labels.sex,
    labels.showType,
    labels.className,
    labels.qualityGrade,
    labels.placement,
    labels.pupn,
    labels.awards,
    labels.reviewText,
    labels.height,
    labels.judge,
  ];
  const body = rows.map((row) => [
    row.registrationNo,
    row.name,
    formatSex(row.sex, labels),
    formatShowType(row),
    formatClassCode(row),
    formatQualityGrade(row),
    formatClassPlacement(row),
    formatPupn(row),
    formatAwards(row),
    formatMaybeString(row.critiqueText),
    formatHeight(row.heightCm),
    formatMaybeString(row.judge),
  ]);

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
  if (columns.includeClassName) header.push(labels.className);
  if (columns.includeQualityGrade) header.push(labels.qualityGrade);
  if (columns.includeClassPlacement) header.push(labels.placement);
  if (columns.includePupn) header.push(labels.pupn);
  if (columns.includeAwards) header.push(labels.awards);
  if (columns.includeHeight) header.push(labels.height);
  if (columns.includeJudge) header.push(labels.judge);
  if (columns.includeReviewText) header.push(labels.reviewText);

  const body = rows.map((row, index) => {
    const cells = [String(index + 1)];
    if (columns.includeShowType) cells.push(formatShowType(row));
    cells.push(row.place, row.date);
    if (columns.includeClassName) cells.push(formatClassCode(row));
    if (columns.includeQualityGrade) cells.push(formatQualityGrade(row));
    if (columns.includeClassPlacement) cells.push(formatClassPlacement(row));
    if (columns.includePupn) cells.push(formatPupn(row));
    if (columns.includeAwards) cells.push(formatAwards(row));
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
  messages,
  clipboard,
  toast,
}: {
  row: ShowDetailClipboardRow;
  labels: ShowDetailClipboardLabels;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  return writeClipboardOutput({
    output: formatShowDetailRowForClipboard(row, labels),
    clipboard,
    messages,
    toast,
  });
}

export async function copyShowDetailRowsToClipboard({
  rows,
  labels,
  messages,
  clipboard,
  toast,
}: {
  rows: ShowDetailClipboardRow[];
  labels: ShowDetailClipboardLabels;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatShowDetailRowsForClipboard(rows, labels),
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
