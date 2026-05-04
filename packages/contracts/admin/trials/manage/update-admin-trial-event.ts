export type UpdateAdminTrialEventRequest = {
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  eventName: string | null;
  organizer: string | null;
  judge: string | null;
  sklKoeId: number | null;
};

export type UpdateAdminTrialEventResponse = {
  trialEventId: string;
};
