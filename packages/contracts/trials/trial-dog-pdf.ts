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

export type TrialDogPdfKoeErat = {
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
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

export type TrialDogPdfData = TrialDogPdfKokeenTiedot &
  TrialDogPdfKoiranTiedot &
  TrialDogPdfKoiranTausta &
  TrialDogPdfKoeErat;
