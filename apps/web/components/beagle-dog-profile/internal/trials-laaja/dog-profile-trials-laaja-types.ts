import type { DogProfileTrialsEraRecapHeaders } from "./dog-profile-trials-era-recap";

export type DogProfileTrialsLaajaHeaders = DogProfileTrialsEraRecapHeaders & {
  no: string;
  place: string;
  date: string;
  weather: string;
  award: string;
  rank: string;
  points: string;
  judge: string;
};
