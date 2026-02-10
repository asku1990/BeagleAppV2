import mariadb from "mariadb";

export type LegacyDogRow = {
  registrationNo: string;
  name: string | null;
  sex: string | null;
  birthDateRaw: string | null;
  sireRegistrationNo: string | null;
  damRegistrationNo: string | null;
  breederName: string | null;
};

export type LegacyBreederRow = {
  name: string | null;
  shortCode: string | null;
  grantedAtRaw: string | null;
  ownerName: string | null;
  city: string | null;
  legacyFlag: string | null;
};

export type LegacyEkRow = {
  registrationNo: string;
  ekNo: number | null;
};

export type LegacyOwnerRow = {
  registrationNo: string;
  ownerName: string | null;
  postalCode: string | null;
  city: string | null;
  ownershipDateRaw: string | null;
};

type LegacyScore = string | number | null;

export type LegacyTrialResultRow = {
  registrationNo: string;
  eventPlace: string | null;
  eventDateRaw: string | null;
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  ke: string | null;
  lk: string | null;
  pa: string | null;
  piste: LegacyScore;
  sija: string | null;
  haku: LegacyScore;
  hauk: LegacyScore;
  yva: LegacyScore;
  hlo: LegacyScore;
  alo: LegacyScore;
  tja: LegacyScore;
  pin: LegacyScore;
  judge: string | null;
  legacyFlag: string | null;
};

export type LegacyShowResultRow = {
  registrationNo: string;
  eventDateRaw: string | null;
  eventPlace: string | null;
  resultText: string | null;
  heightText: string | null;
  judge: string | null;
  legacyFlag: string | null;
};

export type LegacySamakoiraRow = {
  rek1: string | null;
  rek2: string | null;
  rek3: string | null;
  rekMuu: string | null;
  vara: string | null;
};

export type LegacyPhase1Rows = {
  dogs: LegacyDogRow[];
  breeders: LegacyBreederRow[];
  eks: LegacyEkRow[];
  owners: LegacyOwnerRow[];
  trialResults: LegacyTrialResultRow[];
  showResults: LegacyShowResultRow[];
  samakoira: LegacySamakoiraRow[];
};

function getLegacyDatabaseUrl(): string {
  const value = process.env.LEGACY_DATABASE_URL;
  if (!value) {
    throw new Error("LEGACY_DATABASE_URL is not configured.");
  }
  return value;
}

export async function fetchLegacyPhase1Rows(options?: {
  log?: (message: string) => void;
}): Promise<LegacyPhase1Rows> {
  const log = options?.log ?? (() => {});
  const startedAt = Date.now();
  log("Connecting to legacy database...");
  const connection = await mariadb.createConnection(getLegacyDatabaseUrl());
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
      `Fetched trial rows: count=${trialResults.length}, elapsed=${Math.round((Date.now() - trialResultsStartedAt) / 1000)}s`,
    );

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
      trialResults,
      showResults,
      samakoira,
    };
  } finally {
    log("Closing legacy database connection...");
    await connection.end();
    log("Legacy database connection closed");
  }
}
