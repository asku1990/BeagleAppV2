import { connectLegacyDatabase } from "../internal";
import type { LegacyTrialResultRow } from "../types";

// Loads legacy trial rows for phase2 import.
export async function fetchLegacyTrialRows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyTrialResultRow[]> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await connectLegacyDatabase();
  try {
    log("Connected to legacy database");

    const trialResultsStartedAt = Date.now();
    const trialResults = (await connection.query(
      `SELECT REKNO as registrationNo,
              TAPPA as eventPlace,
              TAPPV as eventDateRaw,
              KENNELPIIRI as kennelDistrict,
              KENNELPIIRINRO as kennelDistrictNo,
              KE as ke,
              LK as lk,
              PA as pa,
              PISTE as piste,
              SIJA as sija,
              HAKU as haku,
              HAUK as hauk,
              YVA as yva,
              HLO as hlo,
              ALO as alo,
              TJA as tja,
              PIN as pin,
              TUOM1 as judge,
              VARA as legacyFlag
       FROM akoeall`,
    )) as LegacyTrialResultRow[];
    log(
      `Fetched akoeall source rows: total=${trialResults.length}, elapsed=${Math.round((Date.now() - trialResultsStartedAt) / 1000)}s`,
    );

    log(
      `Legacy trial source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );

    return trialResults;
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
