import type { AdminTrialDetails } from "@beagle/contracts";

export type TrialValidationGapStatus =
  | "missing_from_model"
  | "available_but_incomplete";

type TrialValidationGroup =
  | "event"
  | "dog"
  | "result"
  | "conditions"
  | "status"
  | "additional"
  | "judges";

type TrialValidationCatalogItem = {
  group: TrialValidationGroup;
  targetField: string;
  sourceField?: keyof AdminTrialDetails;
};

export type TrialValidationGapItem = {
  group: TrialValidationGroup;
  targetField: string;
  sourceField: keyof AdminTrialDetails | null;
  status: TrialValidationGapStatus;
};

export type TrialValidationEvaluation = {
  missingFromModel: TrialValidationGapItem[];
  availableButIncomplete: TrialValidationGapItem[];
  availableCount: number;
  totalFieldCount: number;
};

const TRIAL_VALIDATION_FIELD_CATALOG: readonly TrialValidationCatalogItem[] = [
  { group: "event", targetField: "sklKoeId" },
  { group: "event", targetField: "rotukoodi" },
  {
    group: "event",
    targetField: "kennelpiiri",
    sourceField: "kennelDistrict",
  },
  {
    group: "event",
    targetField: "kennelpiirinro",
    sourceField: "kennelDistrictNo",
  },
  { group: "event", targetField: "koekunta", sourceField: "eventPlace" },
  { group: "event", targetField: "koepaiva", sourceField: "eventDate" },
  { group: "event", targetField: "jarjestaja" },
  { group: "event", targetField: "koemuoto" },
  { group: "dog", targetField: "koiranNimi", sourceField: "dogName" },
  {
    group: "dog",
    targetField: "rekisterinumero",
    sourceField: "registrationNo",
  },
  { group: "dog", targetField: "isanNimi" },
  { group: "dog", targetField: "isanRekisterinumero" },
  { group: "dog", targetField: "emanNimi" },
  { group: "dog", targetField: "emanRekisterinumero" },
  { group: "dog", targetField: "omistaja" },
  { group: "dog", targetField: "omistajanKotikunta" },
  { group: "dog", targetField: "sukupuoli" },
  { group: "dog", targetField: "rokotusOk" },
  { group: "dog", targetField: "tunnistusOk" },
  { group: "result", targetField: "era1Alkoi" },
  { group: "result", targetField: "era2Alkoi" },
  { group: "result", targetField: "hakuMin1" },
  { group: "result", targetField: "hakuMin2" },
  { group: "result", targetField: "ajoMin1" },
  { group: "result", targetField: "ajoMin2" },
  { group: "result", targetField: "hyvaksytytAjominuutit" },
  { group: "result", targetField: "ajoajanPisteet" },
  { group: "result", targetField: "hakuKeskiarvo", sourceField: "haku" },
  { group: "result", targetField: "haukkuKeskiarvo", sourceField: "hauk" },
  { group: "result", targetField: "ajotaitoKeskiarvo" },
  {
    group: "result",
    targetField: "ansiopisteetYhteensa",
    sourceField: "piste",
  },
  {
    group: "result",
    targetField: "hakuloysyysTappioYhteensa",
    sourceField: "hlo",
  },
  {
    group: "result",
    targetField: "ajoloysyysTappioYhteensa",
    sourceField: "alo",
  },
  { group: "result", targetField: "tappiopisteetYhteensa" },
  { group: "result", targetField: "loppupisteet", sourceField: "piste" },
  { group: "result", targetField: "palkinto", sourceField: "pa" },
  { group: "result", targetField: "sijoitus", sourceField: "sija" },
  { group: "result", targetField: "koiriaLuokassa" },
  { group: "conditions", targetField: "keli", sourceField: "ke" },
  { group: "conditions", targetField: "paljasMaa" },
  { group: "conditions", targetField: "lumikeli" },
  { group: "status", targetField: "luopui" },
  { group: "status", targetField: "suljettu" },
  { group: "status", targetField: "keskeytetty" },
  { group: "status", targetField: "huomautusTeksti" },
  { group: "additional", targetField: "lisatiedotJson" },
  { group: "judges", targetField: "ryhmatuomariNimi", sourceField: "judge" },
  { group: "judges", targetField: "palkintotuomariNimi" },
  { group: "judges", targetField: "ylituomariNimi" },
  { group: "judges", targetField: "ylituomariNumero" },
] as const;

function isValueComplete(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (typeof value === "boolean") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

// Evaluates AJOK pöytäkirja field availability against the current TrialResult read model.
export function evaluateTrialValidationGaps(
  trial: AdminTrialDetails | null | undefined,
): TrialValidationEvaluation {
  const missingFromModel: TrialValidationGapItem[] = [];
  const availableButIncomplete: TrialValidationGapItem[] = [];
  let availableCount = 0;

  for (const item of TRIAL_VALIDATION_FIELD_CATALOG) {
    if (!item.sourceField) {
      missingFromModel.push({
        group: item.group,
        targetField: item.targetField,
        sourceField: null,
        status: "missing_from_model",
      });
      continue;
    }

    availableCount += 1;
    if (!trial) {
      continue;
    }

    if (!isValueComplete(trial[item.sourceField])) {
      availableButIncomplete.push({
        group: item.group,
        targetField: item.targetField,
        sourceField: item.sourceField,
        status: "available_but_incomplete",
      });
    }
  }

  return {
    missingFromModel,
    availableButIncomplete,
    availableCount,
    totalFieldCount: TRIAL_VALIDATION_FIELD_CATALOG.length,
  };
}
