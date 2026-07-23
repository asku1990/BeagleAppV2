export const ADMIN_TRIAL_ERA_FIELD_LABELS = {
  alkoi: "alkoi",
  hakumin: "hakumin",
  ajomin: "ajomin",
  haku: "haku",
  hauk: "haukku",
  yva: "ajotaito / yleisvaikutelma",
  hlo: "hakulöysyys",
  alo: "ajolöysyys",
  tja: "tie ja estetyöskentely",
  pin: "metsästysinto",
} as const;

export type AdminTrialLisatietoGroup =
  | "olosuhteet"
  | "haku"
  | "haukku"
  | "metsastysinto"
  | "ajo"
  | "muut_ominaisuudet"
  | "unknown";

export type AdminTrialLisatietoInputKind =
  | "marker"
  | "integer"
  | "decimal"
  | "text"
  | "tri-state";

export type AdminTrialLisatietoConfig = {
  koodi: string;
  osa: string;
  group: AdminTrialLisatietoGroup;
  label: string;
  inputKind: AdminTrialLisatietoInputKind;
  sortOrder: number;
  persistenceOrder: number;
  valueHint?: "marker" | "integer" | "decimal" | "text";
  toPersistedValue?: (controlValue: string) => string;
  hideOsaSuffix?: boolean;
  useSemanticControl?: boolean;
};

function defineLisatieto(
  koodi: string,
  group: AdminTrialLisatietoGroup,
  label: string,
  inputKind: AdminTrialLisatietoInputKind,
  sortOrder: number,
  osa = "",
): Omit<AdminTrialLisatietoConfig, "persistenceOrder"> {
  return { koodi, osa, group, label, inputKind, sortOrder };
}

export const ADMIN_TRIAL_LISATIETO_GROUP_LABELS: Record<
  AdminTrialLisatietoGroup,
  string
> = {
  olosuhteet: "Olosuhteet",
  haku: "Haku",
  haukku: "Haukku",
  metsastysinto: "Metsästysinto",
  ajo: "Ajo",
  muut_ominaisuudet: "Muut ominaisuudet",
  unknown: "Muut / tuntemattomat",
};

const ADMIN_TRIAL_LISATIETO_CONFIG_SOURCE = [
  defineLisatieto("10", "olosuhteet", "Vaativat olosuhteet", "marker", 10),
  defineLisatieto("11", "olosuhteet", "Paljas maa", "marker", 11),
  defineLisatieto("12", "olosuhteet", "Lumikeli", "integer", 12),
  defineLisatieto(
    "13",
    "olosuhteet",
    "Kohtalainen tai kova tuuli",
    "marker",
    13,
  ),
  defineLisatieto("14", "olosuhteet", "Kuiva keli", "marker", 14),
  defineLisatieto("15", "olosuhteet", "Kostea keli", "marker", 15),
  defineLisatieto(
    "16",
    "olosuhteet",
    "Kohtalainen tai kova sade",
    "marker",
    16,
  ),
  defineLisatieto("17", "olosuhteet", "Lämpötila °C", "integer", 17),
  defineLisatieto("18", "olosuhteet", "Maasto", "integer", 18),
  defineLisatieto("19", "olosuhteet", "Lumipeitteen laatu", "text", 19),
  defineLisatieto("20", "haku", "Laajuus ilman yöjälkeä", "integer", 20),
  defineLisatieto("21", "haku", "Vainuamistapa", "decimal", 21),
  defineLisatieto("22", "haku", "Hakulöysyys", "decimal", 22),
  defineLisatieto("23", "haku", "Hakukuvio", "integer", 23),
  defineLisatieto("24", "haku", "Suurin etäisyys", "decimal", 24),
  defineLisatieto("25", "haku", "Yöjälki löytyi", "decimal", 25, "a"),
  defineLisatieto("25", "haku", "Yöjälki löytyi", "decimal", 25.1, "b"),
  defineLisatieto("25", "haku", "Yöjälki löytyi", "decimal", 25.2, "c"),
  defineLisatieto("26", "haku", "Eteneminen yöjäljellä", "integer", 26),
  defineLisatieto("27", "haku", "Aika yöjäljellä", "integer", 27, "a"),
  defineLisatieto("27", "haku", "Aika yöjäljellä", "integer", 27.1, "b"),
  defineLisatieto("27", "haku", "Aika yöjäljellä", "integer", 27.2, "c"),
  defineLisatieto("30", "haukku", "Kuuluvuus", "decimal", 30),
  defineLisatieto("31", "haukku", "Kertovuus", "decimal", 31),
  defineLisatieto("32", "haukku", "Intohimoisuus", "decimal", 32),
  defineLisatieto("33", "haukku", "Tiheys", "decimal", 33),
  defineLisatieto("34", "haukku", "Äänien määrä", "decimal", 34),
  defineLisatieto("35", "haukku", "Sukupuolileima", "decimal", 35),
  defineLisatieto("36", "haukku", "Beaglen haukku", "integer", 36),
  defineLisatieto("37", "haukku", "Todettu kuuluvuus", "decimal", 37),
  defineLisatieto(
    "40",
    "metsastysinto",
    "Metsästysinto haun aikana",
    "decimal",
    40,
  ),
  defineLisatieto(
    "41",
    "metsastysinto",
    "Metsästysinto ajon aikana",
    "decimal",
    41,
  ),
  defineLisatieto(
    "42",
    "metsastysinto",
    "Metsästysinto koetteluaikana",
    "decimal",
    42,
  ),
  defineLisatieto("50", "ajo", "Ajotaito", "decimal", 50),
  defineLisatieto("51", "ajo", "Nopeus", "decimal", 51),
  defineLisatieto("52", "ajo", "Tie- ja estetyöskentely", "decimal", 52),
  defineLisatieto("53", "ajo", "Vainuamistapa", "decimal", 53),
  defineLisatieto("54", "ajo", "Havainnot herkkyydestä", "decimal", 54),
  defineLisatieto("55", "ajo", "Ajolöysyyden laatu", "decimal", 55),
  defineLisatieto("56", "ajo", "Ajettava nähty", "decimal", 56),
  defineLisatieto("57", "ajo", "Tie ja esteajoa", "decimal", 57),
  defineLisatieto("58", "ajo", "Todellinen ajoaika", "integer", 58),
  defineLisatieto("59", "ajo", "Hukkatyöskentely", "integer", 59),
  defineLisatieto(
    "60",
    "muut_ominaisuudet",
    "Muiden eläinten ja sorkkaeläinten ajo",
    "decimal",
    60,
  ),
  defineLisatieto("61", "muut_ominaisuudet", "Hallittavuus", "decimal", 61),
  defineLisatieto("62", "muut_ominaisuudet", "Matka ajoerässä", "decimal", 62),
] as const satisfies readonly Omit<
  AdminTrialLisatietoConfig,
  "persistenceOrder"
>[];

export const ADMIN_TRIAL_LISATIETO_CONFIG: readonly AdminTrialLisatietoConfig[] =
  ADMIN_TRIAL_LISATIETO_CONFIG_SOURCE.map((item, index) => ({
    ...item,
    persistenceOrder: index + 1,
  }));

export const ADMIN_TRIAL_LISATIETO_KOODIT = Array.from(
  new Set(ADMIN_TRIAL_LISATIETO_CONFIG.map((item) => item.koodi)),
);

export function getAdminTrialLisatietoConfig(
  koodi: string,
  osa: string,
): AdminTrialLisatietoConfig | null {
  return (
    ADMIN_TRIAL_LISATIETO_CONFIG.find(
      (item) => item.koodi === koodi && item.osa === osa,
    ) ??
    ADMIN_TRIAL_LISATIETO_CONFIG.find(
      (item) => item.koodi === koodi && item.osa === "",
    ) ??
    null
  );
}
