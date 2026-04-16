export type AdminTrialDetailsRequest = {
  trialId: string;
};

export type AdminTrialDetails = {
  trialId: string;
  dogId: string | null;
  dogName: string;
  registrationNo: string | null;
  sklKoeId: number | null;
  entryKey: string;
  eventDate: string;
  eventName: string | null;
  eventPlace: string;
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  ke: string | null;
  lk: string | null;
  pa: string | null;
  piste: number | null;
  sija: string | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  judge: string | null;
  legacyFlag: string | null;
  rawPayloadJson: string | null;
  rawPayloadAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminTrialDetailsResponse = {
  trial: AdminTrialDetails;
};
