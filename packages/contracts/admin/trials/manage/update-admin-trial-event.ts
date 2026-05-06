export type UpdateAdminTrialEventRequest = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
};

export type UpdateAdminTrialEventResponse = {
  trialEventId: string;
};
