import { connectLegacyDatabase } from "../internal";
import type {
  LegacyBreederRow,
  LegacyDogRow,
  LegacyEkRow,
  LegacyOwnerRow,
  LegacyPhase1Rows,
  LegacySamakoiraRow,
} from "../types";

// Loads legacy foundation rows for phase1 import.
export async function fetchLegacyPhase1Rows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyPhase1Rows> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await connectLegacyDatabase();
  try {
    log("Connected to legacy database");

    const dogsStartedAt = Date.now();
    const dogs = (await connection.query(
      `SELECT REKNO as registrationNo,
              KNIMI as name,
              SUKUP as sex,
              SYNTY as birthDateRaw,
              ISREK as sireRegistrationNo,
              EMREK as damRegistrationNo,
              KASVA as breederName
       FROM bearek_id`,
    )) as LegacyDogRow[];
    log(
      `Fetched dogs rows: count=${dogs.length}, elapsed=${Math.round((Date.now() - dogsStartedAt) / 1000)}s`,
    );

    const breedersStartedAt = Date.now();
    const breeders = (await connection.query(
      `SELECT KENNEL as name,
              KELYHE as shortCode,
              MYONNETTY as grantedAtRaw,
              KEOMIS as ownerName,
              POSPAI as city,
              VARA as legacyFlag
       FROM kennel`,
    )) as LegacyBreederRow[];
    log(
      `Fetched breeder rows: count=${breeders.length}, elapsed=${Math.round((Date.now() - breedersStartedAt) / 1000)}s`,
    );

    const eksStartedAt = Date.now();
    const eks = (await connection.query(
      `SELECT REKNO as registrationNo,
              EKNO as ekNo
       FROM bea_apu`,
    )) as LegacyEkRow[];
    log(
      `Fetched EK rows: count=${eks.length}, elapsed=${Math.round((Date.now() - eksStartedAt) / 1000)}s`,
    );

    const ownersStartedAt = Date.now();
    const owners = (await connection.query(
      `SELECT REKNO as registrationNo,
              OMIST as ownerName,
              OMPOSNO as postalCode,
              OMPOSPA as city,
              OMIPV as ownershipDateRaw
       FROM beaom`,
    )) as LegacyOwnerRow[];
    log(
      `Fetched owner rows: count=${owners.length}, elapsed=${Math.round((Date.now() - ownersStartedAt) / 1000)}s`,
    );

    const samakoiraStartedAt = Date.now();
    const samakoira = (await connection.query(
      `SELECT REK_1 as rek1,
              REK_2 as rek2,
              REK_3 as rek3,
              REK_MUU as rekMuu,
              VARA as vara
       FROM samakoira`,
    )) as LegacySamakoiraRow[];
    log(
      `Fetched samakoira rows: count=${samakoira.length}, elapsed=${Math.round((Date.now() - samakoiraStartedAt) / 1000)}s`,
    );

    log(
      `Legacy source fetch completed in ${Math.round((Date.now() - startedAt) / 1000)}s`,
    );

    return {
      dogs,
      breeders,
      eks,
      owners,
      samakoira,
    };
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
