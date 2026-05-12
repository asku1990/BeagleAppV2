import { connectLegacyDatabase } from "../internal";
import type {
  LegacyDogInbreedingRow,
  LegacyKoiranEpiLukuRow,
  LegacyKoiranSairausRow,
  LegacyPhase1_25Rows,
  LegacySairausRow,
} from "../types";

// Loads legacy virtual pairing support rows for phase1.25 import.
export async function fetchLegacyPhase1_25Rows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyPhase1_25Rows> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await connectLegacyDatabase();
  try {
    log("Connected to legacy database");

    const inbreedingStartedAt = Date.now();
    const inbreeding = (await connection.query(
      `SELECT REKNO as registrationNo,
              SIITOSASTE as siitosasteRaw
       FROM bearek_id`,
    )) as LegacyDogInbreedingRow[];
    log(
      `Fetched bearek_id inbreeding rows: total=${inbreeding.length}, elapsed=${Math.round((Date.now() - inbreedingStartedAt) / 1000)}s`,
    );

    const sairaudetStartedAt = Date.now();
    const sairaudet = (await connection.query(
      `SELECT ID as legacyId,
              SAIRAUS as code,
              SAIRAUS_TEKSTI as text
       FROM beasairaudet`,
    )) as LegacySairausRow[];
    log(
      `Fetched beasairaudet rows: total=${sairaudet.length}, elapsed=${Math.round((Date.now() - sairaudetStartedAt) / 1000)}s`,
    );

    const koiranSairaudetStartedAt = Date.now();
    const koiranSairaudet = (await connection.query(
      `SELECT ID as legacyId,
              ISREK as sireRegistrationNo,
              EMREK as damRegistrationNo,
              REKNO as registrationNo,
              PENTUE as litterRaw,
              SAIRAUS as diseaseCode,
              V_KUVAUS as description,
              JULKISUUS as publicRaw,
              TIETOLAHDE as source,
              MUOKATTU as modifiedRaw
       FROM beasairaat`,
    )) as LegacyKoiranSairausRow[];
    log(
      `Fetched beasairaat rows: total=${koiranSairaudet.length}, elapsed=${Math.round((Date.now() - koiranSairaudetStartedAt) / 1000)}s`,
    );

    const epiLuvutStartedAt = Date.now();
    const epiLuvut = (await connection.query(
      `SELECT ID as legacyId,
              REKNO as registrationNo,
              ISREK as sireRegistrationNo,
              EMREK as damRegistrationNo,
              EPILUKU as epiValueRaw,
              EPITEKSTI as epiText,
              MUOKATTU as modifiedRaw,
              VARA as flag
       FROM beaepi`,
    )) as LegacyKoiranEpiLukuRow[];
    log(
      `Fetched beaepi rows: total=${epiLuvut.length}, elapsed=${Math.round((Date.now() - epiLuvutStartedAt) / 1000)}s`,
    );

    log(
      `Legacy phase1.25 source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );

    return {
      inbreeding,
      sairaudet,
      koiranSairaudet,
      epiLuvut,
    };
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
