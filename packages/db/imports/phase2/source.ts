import { createHash } from "node:crypto";
import { connectLegacyDatabase } from "../internal";
import type {
  LegacyTrialMirrorAkoeallRow,
  LegacyTrialMirrorBealtCommonRow,
  LegacyTrialMirrorRows,
  LegacyTrialMirrorTableName,
} from "../types";

type RawLegacyRow = Record<string, string | number | null>;

const TRIAL_MIRROR_TABLES: LegacyTrialMirrorTableName[] = [
  "akoeall",
  "bealt",
  "bealt0",
  "bealt1",
  "bealt2",
  "bealt3",
];

function sourceHash(rawPayloadJson: string): string {
  return createHash("sha256").update(rawPayloadJson).digest("hex");
}

function toRawPayloadJson(
  row: RawLegacyRow,
  columns: readonly string[],
): string {
  const payload: RawLegacyRow = {};
  for (const column of columns) {
    payload[column] = row[column] ?? null;
  }
  return JSON.stringify(payload);
}

function readString(row: RawLegacyRow, column: string): string | null {
  const value = row[column];
  if (value == null) return null;
  return String(value);
}

function readRequiredString(row: RawLegacyRow, column: string): string {
  return readString(row, column) ?? "";
}

function readNumber(row: RawLegacyRow, column: string): number | null {
  const value = row[column];
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function readScore(row: RawLegacyRow, column: string): string | number | null {
  return row[column] ?? null;
}

const AKOEALL_COLUMNS = [
  "REKNO",
  "TAPPA",
  "TAPPV",
  "KENNELPIIRI",
  "KENNELPIIRINRO",
  "KE",
  "LK",
  "PA",
  "PISTE",
  "SIJA",
  "HAKU",
  "HAUK",
  "YVA",
  "HLO",
  "ALO",
  "TJA",
  "PIN",
  "TUOM1",
  "MUOKATTU",
  "VARA",
] as const;

const BEALT_COLUMNS = [
  "REKNO",
  "TAPPA",
  "TAPPV",
  "ERA",
  "HAKUMIN",
  "AJOMIN",
  "HAKU",
  "HAUK",
  "YVA",
  "HLO",
  "ALO",
  "TJA",
  "PIN",
  "LT11",
  "LT12",
  "LT13",
  "LT14",
  "LT15",
  "LT16",
  "LT17",
  "LT18",
  "LT20",
  "LT21",
  "LT30",
  "LT31",
  "LT32",
  "LT33",
  "LT34",
  "LT40",
  "LT41",
  "LT42",
  "LT43",
  "LT44",
  "LT50",
  "LT51",
  "LT52",
  "LT53",
  "VIITE",
  "MUOKATTU",
] as const;

const BEALT1_COLUMNS = [
  "REKNO",
  "TAPPA",
  "TAPPV",
  "ERA",
  "ALKOI",
  "HAKUMIN",
  "AJOMIN",
  ...BEALT_COLUMNS.slice(6),
] as const;

const BEALT0_COLUMNS = [
  "REKNO",
  "TAPPA",
  "TAPPV",
  "ERA",
  "ALKOI",
  "HAKUMIN",
  "AJOMIN",
  "HAKU",
  "HAUK",
  "YVA",
  "HLO",
  "ALO",
  "TJA",
  "PIN",
  "LT11",
  "LT12",
  "LT13",
  "LT21",
  "LT22",
  "LT31",
  "LT32",
  "LT33",
  "LT34",
  "LT41",
  "LT42",
  "LT43",
  "LT44",
  "LT51",
  "LT52",
  "LT61",
  "LT62",
  "LT63",
  "LT64",
  "LT65",
  "LT66",
  "LT71",
  "LT72",
  "LT73",
  "LT74",
  "LT75",
  "LT76",
  "LT77",
  "LT78",
  "LT79",
  "LT80",
  "LT81",
  "VIITE",
  "MUOKATTU",
] as const;

const BEALT2_COLUMNS = [
  "REKNO",
  "TAPPA",
  "TAPPV",
  "ERA",
  "ALKOI",
  "HAKUMIN",
  "AJOMIN",
  "HAKU",
  "HAUK",
  "YVA",
  "HLO",
  "ALO",
  "TJA",
  "PIN",
  "LT11",
  "LT12",
  "LT13",
  "LT14",
  "LT15",
  "LT16",
  "LT17",
  "LT18",
  "LT20",
  "LT21",
  "LT22",
  "LT30",
  "LT31",
  "LT32",
  "LT33",
  "LT34",
  "LT35",
  "LT36",
  "LT40",
  "LT41",
  "LT50",
  "LT51",
  "LT52",
  "LT53",
  "LT54",
  "LT55",
  "LT56",
  "LT60",
  "LT61",
  "VIITE",
  "MUOKATTU",
] as const;

const BEALT3_COLUMNS = [
  ...BEALT2_COLUMNS.slice(0, 34),
  "LT42",
  ...BEALT2_COLUMNS.slice(34),
] as const;

function selectColumns(columns: readonly string[]): string {
  return columns
    .map((column) =>
      column === "MUOKATTU"
        ? "CAST(`MUOKATTU` AS CHAR) AS `MUOKATTU`"
        : `\`${column}\``,
    )
    .join(", ");
}

function toAkoeallRow(row: RawLegacyRow): LegacyTrialMirrorAkoeallRow {
  const rawPayloadJson = toRawPayloadJson(row, AKOEALL_COLUMNS);
  return {
    rekno: readRequiredString(row, "REKNO"),
    tappa: readRequiredString(row, "TAPPA"),
    tappv: readRequiredString(row, "TAPPV"),
    kennelpiiri: readString(row, "KENNELPIIRI"),
    kennelpiirinro: readString(row, "KENNELPIIRINRO"),
    ke: readString(row, "KE"),
    lk: readString(row, "LK"),
    pa: readString(row, "PA"),
    piste: readScore(row, "PISTE"),
    sija: readString(row, "SIJA"),
    haku: readScore(row, "HAKU"),
    hauk: readScore(row, "HAUK"),
    yva: readScore(row, "YVA"),
    hlo: readScore(row, "HLO"),
    alo: readScore(row, "ALO"),
    tja: readScore(row, "TJA"),
    pin: readScore(row, "PIN"),
    tuom1: readString(row, "TUOM1"),
    muokattuRaw: readRequiredString(row, "MUOKATTU"),
    vara: readString(row, "VARA"),
    rawPayloadJson,
    sourceHash: sourceHash(rawPayloadJson),
  };
}

function toBealtRow(
  row: RawLegacyRow,
  columns: readonly string[],
): LegacyTrialMirrorBealtCommonRow {
  const rawPayloadJson = toRawPayloadJson(row, columns);
  const result: LegacyTrialMirrorBealtCommonRow = {
    rekno: readRequiredString(row, "REKNO"),
    tappa: readRequiredString(row, "TAPPA"),
    tappv: readRequiredString(row, "TAPPV"),
    era: readNumber(row, "ERA") ?? 0,
    hakumin: readNumber(row, "HAKUMIN"),
    ajomin: readNumber(row, "AJOMIN"),
    haku: readScore(row, "HAKU"),
    hauk: readScore(row, "HAUK"),
    yva: readScore(row, "YVA"),
    hlo: readScore(row, "HLO"),
    alo: readScore(row, "ALO"),
    tja: readScore(row, "TJA"),
    pin: readScore(row, "PIN"),
    viite: readString(row, "VIITE"),
    muokattuRaw: readRequiredString(row, "MUOKATTU"),
    rawPayloadJson,
    sourceHash: sourceHash(rawPayloadJson),
  };

  for (const column of columns) {
    if (!column.startsWith("LT")) continue;
    const key = column.toLowerCase() as keyof LegacyTrialMirrorBealtCommonRow;
    result[key] = readScore(row, column) as never;
  }

  if (columns.includes("ALKOI")) {
    result.alkoi = readString(row, "ALKOI");
  }

  return result;
}

async function fetchMirrorTable<T>(
  table: LegacyTrialMirrorTableName,
  columns: readonly string[],
  mapper: (row: RawLegacyRow) => T,
  options?: { log?: (message: string) => void },
): Promise<T[]> {
  const log = options?.log ?? (() => {});
  const connection = await connectLegacyDatabase();
  try {
    const startedAt = Date.now();
    const rows = (await connection.query(
      `SELECT ${selectColumns(columns)} FROM \`${table}\``,
    )) as RawLegacyRow[];
    const mapped = rows.map(mapper);
    log(
      `Fetched ${table} source rows: total=${mapped.length}, elapsed=${Math.round((Date.now() - startedAt) / 1000)}s`,
    );
    return mapped;
  } finally {
    await connection.end();
  }
}

// Loads frozen legacy trial mirror rows without projecting them into runtime tables.
export async function fetchLegacyTrialMirrorRows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyTrialMirrorRows> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Loading legacy trial mirror source tables...");

  const [akoeall, bealt, bealt0, bealt1, bealt2, bealt3] = await Promise.all([
    fetchMirrorTable("akoeall", AKOEALL_COLUMNS, toAkoeallRow, { log }),
    fetchMirrorTable(
      "bealt",
      BEALT_COLUMNS,
      (row) => toBealtRow(row, BEALT_COLUMNS),
      { log },
    ),
    fetchMirrorTable(
      "bealt0",
      BEALT0_COLUMNS,
      (row) => toBealtRow(row, BEALT0_COLUMNS),
      { log },
    ),
    fetchMirrorTable(
      "bealt1",
      BEALT1_COLUMNS,
      (row) => toBealtRow(row, BEALT1_COLUMNS),
      { log },
    ),
    fetchMirrorTable(
      "bealt2",
      BEALT2_COLUMNS,
      (row) => toBealtRow(row, BEALT2_COLUMNS),
      { log },
    ),
    fetchMirrorTable(
      "bealt3",
      BEALT3_COLUMNS,
      (row) => toBealtRow(row, BEALT3_COLUMNS),
      { log },
    ),
  ]);

  log(
    `Legacy trial mirror source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
  );

  return { akoeall, bealt, bealt0, bealt1, bealt2, bealt3 };
}

export { TRIAL_MIRROR_TABLES };
