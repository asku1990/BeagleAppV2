export type TrialDogPdfPayload = TrialDogPdfKokeenTiedot &
  TrialDogPdfKoiranTiedot &
  TrialDogPdfKoiranTausta &
  TrialDogPdfAjoajanPisteytys &
  TrialDogPdfAnsiopisteet &
  TrialDogPdfTappiopisteet &
  TrialDogPdfLoppupisteet &
  TrialDogPdfHuomautus &
  TrialDogPdfAllekirjoitukset;

export type TrialDogSex = "MALE" | "FEMALE" | "UNKNOWN";

export type TrialDogPdfDataRequest = {
  trialId: string;
};

export type TrialDogPdfKokeenTiedot = {
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  koekunta: string | null;
  koepaiva: Date;
  jarjestaja: string | null;
};

export type TrialDogPdfKoiranTiedot = {
  registrationNo: string;
  dogName: string | null;
  dogSex: TrialDogSex | null;
};

export type TrialDogPdfKoiranTausta = {
  sireName: string | null;
  sireRegistrationNo: string | null;
  damName: string | null;
  damRegistrationNo: string | null;
  omistaja: string | null;
  omistajanKotikunta: string | null;
};

export type TrialDogPdfAjoajanPisteytys = {
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
};

export type TrialDogPdfAnsiopisteet = {
  hakuEra1: number | null;
  hakuEra2: number | null;
  hakuKeskiarvo: number | null;
  haukkuEra1: number | null;
  haukkuEra2: number | null;
  haukkuKeskiarvo: number | null;
  ajotaitoEra1: number | null;
  ajotaitoEra2: number | null;
  ajotaitoKeskiarvo: number | null;
  ansiopisteetYhteensa: number | null;
};

export type TrialDogPdfTappiopisteet = {
  hakuloysyysTappioEra1: number | null;
  hakuloysyysTappioEra2: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioEra1: number | null;
  ajoloysyysTappioEra2: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
};

export type TrialDogPdfLoppupisteet = {
  loppupisteet: number | null;
  paljasMaaTaiLumi: "PALJAS_MAA" | "LUMI" | null;
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
  sijoitus: string | null;
  koiriaLuokassa: number | null;
  Palkinto: string | null;
};

export type TrialDogPdfHuomautus = {
  huomautusTeksti: string | null;
};

export type TrialDogPdfPayloadWithTrialId = TrialDogPdfPayload & {
  trialId: string;
};

export type TrialDogPdfAllekirjoitukset = {
  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
};
