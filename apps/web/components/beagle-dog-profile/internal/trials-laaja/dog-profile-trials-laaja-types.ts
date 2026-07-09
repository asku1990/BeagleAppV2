export type DogProfileTrialsEraHeaders = {
  era: string;
  alkoi: string;
  hakumin: string;
  ajomin: string;
  haku: string;
  hauk: string;
  ajotaito: string;
  hlo: string;
  alo: string;
  tja: string;
  pin: string;
  huomautus: string;
};

export type DogProfileTrialsLaajaHeaders = DogProfileTrialsEraHeaders & {
  no: string;
  place: string;
  date: string;
  weather: string;
  award: string;
  rank: string;
  points: string;
  judge: string;
};
