export type DogProfileSex = "U" | "N" | "-";

export type DogProfileParent = {
  name: string;
  registrationNo: string | null;
};

export type DogProfileTrialRow = {
  id: string;
  place: string;
  date: string;
  weather: string | null;
  className: string | null;
  rank: string | null;
  points: number | null;
};

export type DogProfileShowRow = {
  id: string;
  place: string;
  date: string;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
};

export type DogProfile = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: string | null;
  sex: DogProfileSex;
  color: string | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: DogProfileParent | null;
  dam: DogProfileParent | null;
  shows: DogProfileShowRow[];
  trials: DogProfileTrialRow[];
};

export type DogProfileSeed = {
  name: string;
  registrationNo: string;
  sex: DogProfileSex;
  ekNo: number | null;
  showCount: number;
  trialCount: number;
};
