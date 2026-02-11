export type HomeStatisticsResponse = {
  registrations: {
    registeredDogs: number;
    youngestRegisteredBirthDate: string | null;
  };
  trials: {
    resultsPeriodStart: string | null;
    resultsPeriodEnd: string | null;
    totalEntries: number;
    performedByDogs: number;
  };
  shows: {
    resultsPeriodStart: string | null;
    resultsPeriodEnd: string | null;
    totalEntries: number;
    performedByDogs: number;
  };
  generatedAt: string;
};
