import {
  ADMIN_TRIAL_LISATIETO_CONFIG,
  type AdminTrialLisatietoConfig,
  type AdminTrialLisatietoInputKind,
} from "./entry-edit-config";
import type { EntryDraft, EraDraft } from "./entry-edit-dialog-model";

export type ResultCreateSemanticInputKind =
  | AdminTrialLisatietoInputKind
  | "tri-state";

export type ResultCreateValueHint = "marker" | "integer" | "decimal" | "text";

export type ResultCreateLisatietoField = AdminTrialLisatietoConfig & {
  inputKind: ResultCreateSemanticInputKind;
  valueHint: ResultCreateValueHint;
  toPersistedValue: (controlValue: string) => string;
};

export type ResultCreateFieldSet = {
  id: "post-2023" | "unverified-fallback";
  verified: boolean;
  rulePeriodMessageKey:
    | "admin.trials.manage.resultCreate.rulePeriod.post2023"
    | "admin.trials.manage.resultCreate.rulePeriod.unverified";
  entryFields: ReadonlySet<keyof EntryDraft>;
  eraFields: ReadonlySet<Exclude<keyof EraDraft, "era">>;
  lisatiedot: readonly ResultCreateLisatietoField[];
};

export const SEEDED_TRIAL_RULE_WINDOW_IDS = [
  "trw_pre_20020801",
  "trw_range_2002_2005",
  "trw_range_2005_2011",
  "trw_post_20110801",
  "trw_post_20230801",
] as const;

const ALL_ENTRY_FIELDS = new Set<keyof EntryDraft>([
  "koemaasto",
  "koemuoto",
  "koetyyppi",
  "ke",
  "lk",
  "award",
  "rank",
  "points",
  "koiriaLuokassa",
  "hyvaksytytAjominuutit",
  "ajoajanPisteet",
  "haku",
  "hauk",
  "yva",
  "hlo",
  "alo",
  "tja",
  "pin",
  "ansiopisteetYhteensa",
  "tappiopisteetYhteensa",
  "judge",
  "huomautus",
  "huomautusTeksti",
  "ylituomariNumeroSnapshot",
  "ryhmatuomariNimi",
  "palkintotuomariNimi",
  "omistajaSnapshot",
  "omistajanKotikuntaSnapshot",
]);

const ALL_ERA_FIELDS = new Set<Exclude<keyof EraDraft, "era">>([
  "alkoi",
  "hakumin",
  "ajomin",
  "haku",
  "hauk",
  "yva",
  "hlo",
  "alo",
  "tja",
  "pin",
  "huomautusTeksti",
]);

function identity(value: string): string {
  return value;
}

function toMarkerPersistence(value: string): string {
  return value === "1" ? "1" : "";
}

function withSemantics(
  config: AdminTrialLisatietoConfig,
  inputKind: ResultCreateSemanticInputKind = config.inputKind,
): ResultCreateLisatietoField {
  return {
    ...config,
    inputKind,
    valueHint:
      inputKind === "tri-state"
        ? "marker"
        : (inputKind as ResultCreateValueHint),
    toPersistedValue: inputKind === "marker" ? toMarkerPersistence : identity,
    useSemanticControl: true,
  };
}

const FALLBACK_LISATIEDOT = ADMIN_TRIAL_LISATIETO_CONFIG.map((config) =>
  withSemantics(config),
);

const POST_2023_INPUT_OVERRIDES: Readonly<
  Record<string, ResultCreateSemanticInputKind>
> = {
  "19": "integer",
  "23": "decimal",
  "26": "decimal",
  "59": "decimal",
};

const POST_2023_LISATIETO_CODES = new Set([
  ...Array.from({ length: 18 }, (_, index) => String(index + 10)),
  ...Array.from({ length: 13 }, (_, index) => String(index + 30)),
  ...Array.from({ length: 13 }, (_, index) => String(index + 50)),
]);

const POST_2023_LISATIEDOT = ADMIN_TRIAL_LISATIETO_CONFIG.filter(
  (config) =>
    POST_2023_LISATIETO_CODES.has(config.koodi) &&
    (!(config.koodi === "25" || config.koodi === "27") || config.osa === "a"),
).map((config) => ({
  ...withSemantics(config, POST_2023_INPUT_OVERRIDES[config.koodi]),
  hideOsaSuffix: config.koodi === "25" || config.koodi === "27",
}));

const POST_2023_FIELD_SET: ResultCreateFieldSet = {
  id: "post-2023",
  verified: true,
  rulePeriodMessageKey: "admin.trials.manage.resultCreate.rulePeriod.post2023",
  entryFields: new Set(
    [...ALL_ENTRY_FIELDS].filter((field) => field !== "tja" && field !== "pin"),
  ),
  eraFields: new Set(
    [...ALL_ERA_FIELDS].filter((field) => field !== "tja" && field !== "pin"),
  ),
  lisatiedot: POST_2023_LISATIEDOT,
};

const UNVERIFIED_FALLBACK_FIELD_SET: ResultCreateFieldSet = {
  id: "unverified-fallback",
  verified: false,
  rulePeriodMessageKey:
    "admin.trials.manage.resultCreate.rulePeriod.unverified",
  entryFields: ALL_ENTRY_FIELDS,
  eraFields: ALL_ERA_FIELDS,
  lisatiedot: FALLBACK_LISATIEDOT,
};

export function resolveResultCreateFieldSet(
  trialRuleWindowId: string | null,
): ResultCreateFieldSet {
  return trialRuleWindowId === "trw_post_20230801"
    ? POST_2023_FIELD_SET
    : UNVERIFIED_FALLBACK_FIELD_SET;
}
