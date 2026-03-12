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
  samakoira: LegacySamakoiraRow[];
};
