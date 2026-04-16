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
  keli: string | null;
  paljasMaa: boolean | null;
  lumikeli: string | null;
  luokka: string | null;
  palkinto: string | null;
  loppupisteet: number | null;
  sijoitus: string | null;
  hakuKeskiarvo: number | null;
  haukkuKeskiarvo: number | null;
  yleisvaikutelmaPisteet: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tieJaEstetyoskentelyPisteet: number | null;
  metsastysintoPisteet: number | null;
  ylituomariNimi: string | null;
  rokotusOk: boolean | null;
  tunnistusOk: boolean | null;
  notes: string | null;
  rawPayloadJson: string | null;
  rawPayloadAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminTrialDetailsResponse = {
  trial: AdminTrialDetails;
};
