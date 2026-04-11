import { connectLegacyDatabase } from "../internal";
import type { LegacyDogTitleRow } from "../types";

// Loads legacy dog title rows for phase1.5 import.
export async function fetchLegacyPhase1_5Rows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyDogTitleRow[]> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await connectLegacyDatabase();
  try {
    log("Connected to legacy database");

    const titleRowsStartedAt = Date.now();
    const titleRows = (await connection.query(
      `SELECT REKNO as registrationNo,
              VALIO as titleCodeRaw
       FROM bea_apu`,
    )) as LegacyDogTitleRow[];
    log(
      `Fetched bea_apu title source rows: total=${titleRows.length}, elapsed=${Math.round((Date.now() - titleRowsStartedAt) / 1000)}s`,
    );

    log(
      `Legacy title source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );

    return titleRows;
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
