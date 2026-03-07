// Formats public beagle trial rows into TSV output and centralizes clipboard
// write/toast handling for trial pages and dog profile trial sections.
import type {
  BeagleDogProfileTrialRowDto,
  BeagleTrialDetailsRow,
  BeagleTrialSearchRow,
} from "@beagle/contracts";

type TrialClipboardLabels = {
  no: string;
  registrationNo: string;
  name: string;
  sex: string;
  weather: string;
  award: string;
  rank: string;
  points: string;
  judge: string;
  searchWork: string;
  barking: string;
  generalImpression: string;
  searchLoosenessPenalty: string;
  chaseLoosenessPenalty: string;
  obstacleWork: string;
  totalPoints: string;
};

type TrialSearchClipboardLabels = {
  date: string;
  place: string;
  judge: string;
  dogCount: string;
};

type DogProfileTrialClipboardLabels = {
  no: string;
  place: string;
  date: string;
  weather: string;
  award: string;
  rank: string;
  points: string;
  judge: string;
  searchWork: string;
  barking: string;
  generalImpression: string;
  searchLoosenessPenalty: string;
  chaseLoosenessPenalty: string;
  obstacleWork: string;
  totalPoints: string;
};

type DogProfileTrialClipboardColumns = {
  includeWeather: boolean;
  includeAward: boolean;
  includeRank: boolean;
  includePoints: boolean;
  includeJudge: boolean;
  includeSearchWork: boolean;
  includeBarking: boolean;
  includeGeneralImpression: boolean;
  includeSearchLoosenessPenalty: boolean;
  includeChaseLoosenessPenalty: boolean;
  includeObstacleWork: boolean;
  includeTotalPoints: boolean;
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

function formatMaybeString(value: string | null): string {
  return value?.trim() ? value : "-";
}

function formatMaybeNumber(value: number | null): string {
  return value == null ? "-" : String(value);
}

function formatDogProfilePoints(value: number | null): string {
  return value == null ? "-" : value.toFixed(2);
}

function formatAwardForClipboard(
  award: string | null,
  classCode: string | null,
): string {
  if (!award?.trim()) return "-";
  if (!classCode) return award;
  if (/^(Avo|Voi|Beaj)\s/.test(award)) return award;

  if (classCode === "A") return `Avo ${award}`;
  if (classCode === "V") return `Voi ${award}`;
  return `Beaj ${award}`;
}

export function formatTrialDetailRowForClipboard(
  row: BeagleTrialDetailsRow,
  labels: TrialClipboardLabels,
  index: number,
): string {
  const header = [
    labels.no,
    labels.registrationNo,
    labels.name,
    labels.sex,
    labels.weather,
    labels.award,
    labels.rank,
    labels.points,
    labels.judge,
    labels.searchWork,
    labels.barking,
    labels.generalImpression,
    labels.searchLoosenessPenalty,
    labels.chaseLoosenessPenalty,
    labels.obstacleWork,
    labels.totalPoints,
  ];

  const body = [
    String(index),
    row.registrationNo,
    row.name,
    row.sex,
    formatMaybeString(row.weather),
    formatAwardForClipboard(row.award, row.classCode),
    formatMaybeString(row.rank),
    formatMaybeNumber(row.points),
    formatMaybeString(row.judge),
    formatMaybeNumber(row.haku),
    formatMaybeNumber(row.hauk),
    // yva = yleisvaikutelma (overall impression)
    formatMaybeNumber(row.yva),
    // hlo = hakulöysyys (search looseness penalty)
    formatMaybeNumber(row.hlo),
    // alo = ajolöysyys (chase looseness penalty)
    formatMaybeNumber(row.alo),
    // tja = tie- ja estetyöskentely (obstacle/road work)
    formatMaybeNumber(row.tja),
    // pin = kokonais-/palkintopisteet (total points)
    formatMaybeNumber(row.pin),
  ];

  return [header, body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatTrialDetailRowsForClipboard(
  rows: BeagleTrialDetailsRow[],
  labels: TrialClipboardLabels,
): string {
  if (rows.length === 0) return "";

  const header = [
    labels.no,
    labels.registrationNo,
    labels.name,
    labels.sex,
    labels.weather,
    labels.award,
    labels.rank,
    labels.points,
    labels.judge,
    labels.searchWork,
    labels.barking,
    labels.generalImpression,
    labels.searchLoosenessPenalty,
    labels.chaseLoosenessPenalty,
    labels.obstacleWork,
    labels.totalPoints,
  ];

  const body = rows.map((row, index) => [
    String(index + 1),
    row.registrationNo,
    row.name,
    row.sex,
    formatMaybeString(row.weather),
    formatAwardForClipboard(row.award, row.classCode),
    formatMaybeString(row.rank),
    formatMaybeNumber(row.points),
    formatMaybeString(row.judge),
    formatMaybeNumber(row.haku),
    formatMaybeNumber(row.hauk),
    // yva = yleisvaikutelma (overall impression)
    formatMaybeNumber(row.yva),
    // hlo = hakulöysyys (search looseness penalty)
    formatMaybeNumber(row.hlo),
    // alo = ajolöysyys (chase looseness penalty)
    formatMaybeNumber(row.alo),
    // tja = tie- ja estetyöskentely (obstacle/road work)
    formatMaybeNumber(row.tja),
    // pin = kokonais-/palkintopisteet (total points)
    formatMaybeNumber(row.pin),
  ]);

  return [header, ...body]
    .map((cells) => cells.map(sanitizeCell).join("\t"))
    .join("\n");
}

export function formatTrialSearchRowsForClipboard(
  rows: BeagleTrialSearchRow[],
  labels: TrialSearchClipboardLabels,
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

export function formatDogProfileTrialRowsForClipboard(
  rows: BeagleDogProfileTrialRowDto[],
  labels: DogProfileTrialClipboardLabels,
  columns: DogProfileTrialClipboardColumns,
): string {
  if (rows.length === 0) return "";

  const header = [labels.no, labels.place, labels.date];
  if (columns.includeWeather) header.push(labels.weather);
  if (columns.includeAward) header.push(labels.award);
  if (columns.includeRank) header.push(labels.rank);
  if (columns.includePoints) header.push(labels.points);
  if (columns.includeJudge) header.push(labels.judge);
  if (columns.includeSearchWork) header.push(labels.searchWork);
  if (columns.includeBarking) header.push(labels.barking);
  if (columns.includeGeneralImpression) header.push(labels.generalImpression);
  if (columns.includeSearchLoosenessPenalty) {
    header.push(labels.searchLoosenessPenalty);
  }
  if (columns.includeChaseLoosenessPenalty) {
    header.push(labels.chaseLoosenessPenalty);
  }
  if (columns.includeObstacleWork) header.push(labels.obstacleWork);
  if (columns.includeTotalPoints) header.push(labels.totalPoints);

  const body = rows.map((row, index) => {
    const cells = [String(index + 1), row.place, row.date];
    if (columns.includeWeather) cells.push(formatMaybeString(row.weather));
    if (columns.includeAward) {
      cells.push(formatMaybeString(row.className ?? row.award));
    }
    if (columns.includeRank) cells.push(formatMaybeString(row.rank));
    if (columns.includePoints) cells.push(formatDogProfilePoints(row.points));
    if (columns.includeJudge) cells.push(formatMaybeString(row.judge));
    if (columns.includeSearchWork) cells.push(formatMaybeNumber(row.haku));
    if (columns.includeBarking) cells.push(formatMaybeNumber(row.hauk));
    if (columns.includeGeneralImpression)
      cells.push(formatMaybeNumber(row.yva));
    if (columns.includeSearchLoosenessPenalty) {
      cells.push(formatMaybeNumber(row.hlo));
    }
    if (columns.includeChaseLoosenessPenalty) {
      cells.push(formatMaybeNumber(row.alo));
    }
    if (columns.includeObstacleWork) cells.push(formatMaybeNumber(row.tja));
    if (columns.includeTotalPoints) cells.push(formatMaybeNumber(row.pin));
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

export async function copyTrialSearchRowsToClipboard({
  rows,
  labels,
  messages,
  clipboard,
  toast,
}: {
  rows: BeagleTrialSearchRow[];
  labels: TrialSearchClipboardLabels;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatTrialSearchRowsForClipboard(rows, labels),
    clipboard,
    messages,
    toast,
  });
}

export async function copyTrialDetailRowToClipboard({
  row,
  labels,
  index,
  messages,
  clipboard,
  toast,
}: {
  row: BeagleTrialDetailsRow;
  labels: TrialClipboardLabels;
  index: number;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  return writeClipboardOutput({
    output: formatTrialDetailRowForClipboard(row, labels, index),
    clipboard,
    messages,
    toast,
  });
}

export async function copyTrialDetailRowsToClipboard({
  rows,
  labels,
  messages,
  clipboard,
  toast,
}: {
  rows: BeagleTrialDetailsRow[];
  labels: TrialClipboardLabels;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatTrialDetailRowsForClipboard(rows, labels),
    clipboard,
    messages,
    toast,
  });
}

export async function copyDogProfileTrialRowsToClipboard({
  rows,
  labels,
  columns,
  messages,
  clipboard,
  toast,
}: {
  rows: BeagleDogProfileTrialRowDto[];
  labels: DogProfileTrialClipboardLabels;
  columns: DogProfileTrialClipboardColumns;
  messages: ClipboardMessages;
  clipboard?: ClipboardLike;
  toast: ClipboardToastHandlers;
}) {
  if (rows.length === 0) return false;

  return writeClipboardOutput({
    output: formatDogProfileTrialRowsForClipboard(rows, labels, columns),
    clipboard,
    messages,
    toast,
  });
}
