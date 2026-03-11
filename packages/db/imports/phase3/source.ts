import mariadb from "mariadb";
import type { LegacyShowResultRow } from "../types";

function getLegacyDatabaseUrl(): string {
  const value = process.env.LEGACY_DATABASE_URL;
  if (!value) {
    throw new Error("LEGACY_DATABASE_URL is not configured.");
  }
  return value;
}

// Loads legacy show rows for phase3 import.
export async function fetchLegacyShowRows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyShowResultRow[]> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await mariadb.createConnection(getLegacyDatabaseUrl());
  try {
    log("Connected to legacy database");

    const showResultsStartedAt = Date.now();
    const showResults = (await connection.query(
      `SELECT REKNO as registrationNo,
              TAPPV as eventDateRaw,
              TAPPA as eventPlace,
              TULNI as resultText,
              KORK as heightText,
              TUOM1 as judge,
              VARA as legacyFlag
       FROM nay9599`,
    )) as LegacyShowResultRow[];
    log(
      `Fetched show rows: count=${showResults.length}, elapsed=${Math.round((Date.now() - showResultsStartedAt) / 1000)}s`,
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
