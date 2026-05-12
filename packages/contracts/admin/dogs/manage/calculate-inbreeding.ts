export type CalculateAdminDogInbreedingRequest = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
};

export type CalculateAdminDogInbreedingResponse = {
  inbreedingCoefficientPct: number | null;
};
