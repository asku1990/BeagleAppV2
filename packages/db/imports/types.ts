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

export type LegacyDogTitleRow = {
  registrationNo: string | null;
  titleCodeRaw: string | null;
};

export type LegacyOwnerRow = {
  registrationNo: string;
  ownerName: string | null;
  postalCode: string | null;
  city: string | null;
  ownershipDateRaw: string | null;
};

type LegacyScore = string | number | null;

export type LegacyTrialMirrorTableName =
  | "akoeall"
  | "bealt"
  | "bealt0"
  | "bealt1"
  | "bealt2"
  | "bealt3";

export type LegacyTrialMirrorAkoeallRow = {
  rekno: string;
  tappa: string;
  tappv: string;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
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
  tuom1: string | null;
  muokattuRaw: string;
  vara: string | null;
  rawPayloadJson: string;
  sourceHash: string;
};

export type LegacyTrialMirrorBealtCommonRow = {
  rekno: string;
  tappa: string;
  tappv: string;
  era: number;
  alkoi?: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: LegacyScore;
  hauk: LegacyScore;
  yva: LegacyScore;
  hlo: LegacyScore;
  alo: LegacyScore;
  tja: LegacyScore;
  pin: LegacyScore;
  lt11?: LegacyScore;
  lt12?: LegacyScore;
  lt13?: LegacyScore;
  lt14?: LegacyScore;
  lt15?: LegacyScore;
  lt16?: LegacyScore;
  lt17?: string | null;
  lt18?: LegacyScore;
  lt20?: LegacyScore;
  lt21?: LegacyScore;
  lt22?: LegacyScore;
  lt30?: LegacyScore;
  lt31?: LegacyScore;
  lt32?: LegacyScore;
  lt33?: LegacyScore;
  lt34?: LegacyScore;
  lt35?: LegacyScore;
  lt36?: LegacyScore;
  lt40?: LegacyScore;
  lt41?: LegacyScore;
  lt42?: LegacyScore;
  lt43?: LegacyScore;
  lt44?: LegacyScore;
  lt50?: LegacyScore;
  lt51?: LegacyScore;
  lt52?: LegacyScore;
  lt53?: LegacyScore;
  lt54?: LegacyScore;
  lt55?: LegacyScore;
  lt56?: LegacyScore;
  lt60?: LegacyScore;
  lt61?: LegacyScore;
  lt62?: LegacyScore;
  lt63?: LegacyScore;
  lt64?: LegacyScore;
  lt65?: LegacyScore;
  lt66?: LegacyScore;
  lt71?: LegacyScore;
  lt72?: LegacyScore;
  lt73?: LegacyScore;
  lt74?: LegacyScore;
  lt75?: LegacyScore;
  lt76?: LegacyScore;
  lt77?: LegacyScore;
  lt78?: LegacyScore;
  lt79?: LegacyScore;
  lt80?: LegacyScore;
  lt81?: LegacyScore;
  viite: string | null;
  muokattuRaw: string;
  rawPayloadJson: string;
  sourceHash: string;
};

export type LegacyTrialMirrorRows = {
  akoeall: LegacyTrialMirrorAkoeallRow[];
  bealt: LegacyTrialMirrorBealtCommonRow[];
  bealt0: LegacyTrialMirrorBealtCommonRow[];
  bealt1: LegacyTrialMirrorBealtCommonRow[];
  bealt2: LegacyTrialMirrorBealtCommonRow[];
  bealt3: LegacyTrialMirrorBealtCommonRow[];
};

export type LegacyTrialMirrorCounts = Record<
  LegacyTrialMirrorTableName,
  number
>;

export type LegacyTrialMirrorDetailTableName = Exclude<
  LegacyTrialMirrorTableName,
  "akoeall"
>;

export type LegacyTrialMirrorAkoeallValidationRow = {
  sourceTable: "akoeall";
  rekno: string;
  tappa: string;
  tappv: string;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  ke: string | null;
  lk: string | null;
  pa: string | null;
  piste: string | null;
  sija: string | null;
  haku: string | null;
  hauk: string | null;
  yva: string | null;
  hlo: string | null;
  alo: string | null;
  tja: string | null;
  pin: string | null;
  tuom1: string | null;
  muokattuRaw: string;
  vara: string | null;
  rawPayloadJson: string;
  sourceHash: string | null;
};

export type LegacyTrialMirrorDetailValidationRow = {
  sourceTable: LegacyTrialMirrorDetailTableName;
  rekno: string;
  tappa: string;
  tappv: string;
  era: number;
  hakumin: number | null;
  ajomin: number | null;
  haku: string | null;
  hauk: string | null;
  yva: string | null;
  hlo: string | null;
  alo: string | null;
  tja: string | null;
  pin: string | null;
  muokattuRaw: string;
  rawPayloadJson: string;
  sourceHash: string | null;
};

export type LegacyTrialMirrorValidationRows = {
  akoeall: LegacyTrialMirrorAkoeallValidationRow[];
  details: LegacyTrialMirrorDetailValidationRow[];
};

export type LegacyShowResultRow = {
  registrationNo: string;
  eventDateRaw: string | null;
  eventPlace: string | null;
  resultText: string | null;
  critiqueText: string | null;
  dogName: string | null;
  heightText: string | null;
  judge: string | null;
  legacyFlag: string | null;
  // Row origin for merged show result rows.
  // `beanay_text` is excluded because it is joined only as critique text.
  sourceTable: "nay9599" | "beanay" | "nay9599_rd_ud";
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
