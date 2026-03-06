import type {
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

function sanitizeCell(value: string): string {
  return value.replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function formatMaybeString(value: string | null): string {
  return value?.trim() ? value : "-";
}

function formatMaybeNumber(value: number | null): string {
  return value == null ? "-" : String(value);
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
