import { connectLegacyDatabase } from "../internal";
import type { LegacyShowResultRow } from "../types";

type RawLegacyShowRow = Omit<
  LegacyShowResultRow,
  "critiqueText" | "dogName"
> & {
  critiqueText?: string | null;
  dogName?: string | null;
};

function normalizeLegacyKeyPart(value: string | null | undefined): string {
  if (!value) return "";
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
}

function toLegacyDateKey(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length !== 8) return "";
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

function toLegacyMergeKey(row: {
  registrationNo: string;
  eventDateRaw: string | null;
  eventPlace: string | null;
}): string | null {
  const registrationKey = normalizeLegacyKeyPart(row.registrationNo);
  const eventDateKey = toLegacyDateKey(row.eventDateRaw);
  const eventPlaceKey = normalizeLegacyKeyPart(row.eventPlace);
  if (!registrationKey || !eventDateKey || !eventPlaceKey) return null;
  return `${registrationKey}|${eventDateKey}|${eventPlaceKey}`;
}

function sourcePriority(
  sourceTable: LegacyShowResultRow["sourceTable"],
): number {
  if (sourceTable === "nay9599_rd_ud") return 3;
  if (sourceTable === "nay9599") return 2;
  return 1;
}

async function tableExists(
  connection: Awaited<ReturnType<typeof connectLegacyDatabase>>,
  tableName: string,
): Promise<boolean> {
  const rows = (await connection.query(
    "SELECT 1 AS ok FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ? LIMIT 1",
    [tableName],
  )) as Array<{ ok?: number }>;
  return rows.length > 0;
}

// Loads legacy show rows for phase3 import.
export async function fetchLegacyShowRows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyShowResultRow[]> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await connectLegacyDatabase();
  try {
    log("Connected to legacy database");

    const hasRdUdTable = await tableExists(connection, "nay9599_rd_ud");
    log(`Optional source table nay9599_rd_ud exists=${hasRdUdTable}`);

    const showResultsStartedAt = Date.now();
    const baseRows = (await connection.query(
      `SELECT n.REKNO as registrationNo,
              n.TAPPV as eventDateRaw,
              n.TAPPA as eventPlace,
              n.TULNI as resultText,
              n.KORK as heightText,
              n.TUOM1 as judge,
              n.VARA as legacyFlag,
              b.KNIMI as dogName,
              'nay9599' as sourceTable
       FROM nay9599 n
       LEFT JOIN bearek_id b ON b.REKNO = n.REKNO
       UNION ALL
       SELECT n.REKNO as registrationNo,
              n.TAPPV as eventDateRaw,
              n.TAPPA as eventPlace,
              n.TULNI as resultText,
              n.KORK as heightText,
              n.TUOM1 as judge,
              n.VARA as legacyFlag,
              b.KNIMI as dogName,
              'beanay' as sourceTable
       FROM beanay n
       LEFT JOIN bearek_id b ON b.REKNO = n.REKNO`,
    )) as RawLegacyShowRow[];

    let rdUdRows: RawLegacyShowRow[] = [];
    if (hasRdUdTable) {
      rdUdRows = (await connection.query(
        `SELECT n.REKNO as registrationNo,
                n.TAPPV as eventDateRaw,
                n.TAPPA as eventPlace,
                n.TULNI as resultText,
                n.KORK as heightText,
                n.TUOM1 as judge,
                n.VARA as legacyFlag,
                b.KNIMI as dogName,
                'nay9599_rd_ud' as sourceTable
         FROM nay9599_rd_ud n
         LEFT JOIN bearek_id b ON b.REKNO = n.REKNO`,
      )) as RawLegacyShowRow[];
    }

    const critiqueRows = (await connection.query(
      `SELECT REKNO as registrationNo,
              TAPPV as eventDateRaw,
              TAPPA as eventPlace,
              TEKSTI as critiqueText
       FROM beanay_text`,
    )) as Array<{
      registrationNo: string;
      eventDateRaw: string | null;
      eventPlace: string | null;
      critiqueText: string | null;
    }>;

    const critiqueByKey = new Map<string, string>();
    for (const row of critiqueRows) {
      const key = toLegacyMergeKey(row);
      if (!key) continue;
      const text = row.critiqueText?.trim();
      if (!text) continue;
      critiqueByKey.set(key, text);
    }

    const mergedByKey = new Map<
      string,
      {
        row: RawLegacyShowRow;
        priority: number;
      }
    >();
    const rowsWithoutMergeKey: RawLegacyShowRow[] = [];

    for (const row of [...baseRows, ...rdUdRows]) {
      const key = toLegacyMergeKey(row);
      if (!key) {
        rowsWithoutMergeKey.push(row);
        continue;
      }
      const priority = sourcePriority(row.sourceTable);
      const existing = mergedByKey.get(key);
      if (!existing || priority > existing.priority) {
        mergedByKey.set(key, { row, priority });
      }
    }

    const showResults: LegacyShowResultRow[] = [];
    for (const [key, item] of mergedByKey) {
      showResults.push({
        ...item.row,
        critiqueText: critiqueByKey.get(key) ?? null,
        dogName: item.row.dogName ?? null,
      });
    }
    for (const row of rowsWithoutMergeKey) {
      showResults.push({
        ...row,
        critiqueText: null,
        dogName: row.dogName ?? null,
      });
    }

    log(
      `Fetched and merged show rows: count=${showResults.length}, mergedKeys=${mergedByKey.size}, passthroughRowsWithoutMergeKey=${rowsWithoutMergeKey.length}, elapsed=${Math.round((Date.now() - showResultsStartedAt) / 1000)}s`,
    );

    log(
      `Legacy show source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );

    return showResults;
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
