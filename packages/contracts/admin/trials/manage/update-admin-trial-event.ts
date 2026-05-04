export type UpdateAdminTrialEventRequest = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
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
