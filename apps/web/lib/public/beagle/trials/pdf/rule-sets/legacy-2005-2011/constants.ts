type ScoreValueKey2005To2011 =
  | "hakuEra1"
  | "hakuEra2"
  | "hakuKeskiarvo"
  | "haukkuEra1"
  | "haukkuEra2"
  | "haukkuKeskiarvo"
  | "ajotaitoEra1"
  | "ajotaitoEra2"
  | "ajotaitoKeskiarvo"
  | "hakuloysyysTappioEra1"
  | "hakuloysyysTappioEra2"
  | "hakuloysyysTappioYhteensa"
  | "ajoloysyysTappioEra1"
  | "ajoloysyysTappioEra2"
  | "ajoloysyysTappioYhteensa";

type ScoreRow2005To2011 = {
  label: string;
  y: number;
  era1: ScoreValueKey2005To2011;
  era2: ScoreValueKey2005To2011;
  total: ScoreValueKey2005To2011;
};

export const ERA_COLUMNS_2005_2011 = {
  era1: 402,
  era2: 456,
  total: 512,
} as const;

export const LISATIEDOT_CODES_2005_2011 = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "20",
  "21",
  "22",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "40",
  "41",
  "50",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "60",
  "61",
] as const;

export const SCORE_ROWS_2005_2011: ScoreRow2005To2011[] = [
  {
    label: "Haku",
    y: 322,
    era1: "hakuEra1",
    era2: "hakuEra2",
    total: "hakuKeskiarvo",
  },
  {
    label: "Haukku",
    y: 304,
    era1: "haukkuEra1",
    era2: "haukkuEra2",
    total: "haukkuKeskiarvo",
  },
  {
    label: "Ajotaito",
    y: 286,
    era1: "ajotaitoEra1",
    era2: "ajotaitoEra2",
    total: "ajotaitoKeskiarvo",
  },
  {
    label: "Hakuloisyys",
    y: 250,
    era1: "hakuloysyysTappioEra1",
    era2: "hakuloysyysTappioEra2",
    total: "hakuloysyysTappioYhteensa",
  },
  {
    label: "Ajoloisyys",
    y: 232,
    era1: "ajoloysyysTappioEra1",
    era2: "ajoloysyysTappioEra2",
    total: "ajoloysyysTappioYhteensa",
  },
] satisfies Array<ScoreRow2005To2011>;
