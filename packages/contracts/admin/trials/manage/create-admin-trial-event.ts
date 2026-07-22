export type CreateAdminTrialEventRequest = {
  eventDate: string;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number;
};

export type CreateAdminTrialEventResponse = {
  trialEventId: string;
};
