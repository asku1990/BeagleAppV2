import type {
  BeagleShowDetailsRow,
  BeagleShowSearchRow,
} from "@beagle/contracts";

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
  result: string;
  reviewText: string;
  height: string;
  judge: string;
  sexMale: string;
  sexFemale: string;
  sexUnknown: string;
};

type ShowDetailClipboardRow = BeagleShowDetailsRow & {
  reviewText?: string | null;
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
    labels.result,
    labels.reviewText,
    labels.height,
    labels.judge,
  ];
  const body = [
    row.registrationNo,
    row.name,
    formatSex(row.sex, labels),
    formatMaybeString(row.result),
    formatMaybeString(row.reviewText),
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
    labels.result,
    labels.reviewText,
    labels.height,
    labels.judge,
  ];
  const body = rows.map((row) => [
    row.registrationNo,
    row.name,
    formatSex(row.sex, labels),
    formatMaybeString(row.result),
    formatMaybeString(row.reviewText),
    formatHeight(row.heightCm),
    formatMaybeString(row.judge),
  ]);

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
