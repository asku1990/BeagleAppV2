import type { AdminTrialDetails } from "@beagle/contracts";
import { TRIAL_FIELD_CONTRACT_CATALOG } from "./trial-field-contract";

export type TrialValidationGapStatus =
  | "missing_from_model"
  | "available_but_incomplete";

export type TrialValidationGapItem = {
  group: (typeof TRIAL_FIELD_CONTRACT_CATALOG)[number]["group"];
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

// Evaluates AJOK poytakirja field availability against the current TrialResult read model.
export function evaluateTrialValidationGaps(
  trial: AdminTrialDetails | null | undefined,
): TrialValidationEvaluation {
  const missingFromModel: TrialValidationGapItem[] = [];
  const availableButIncomplete: TrialValidationGapItem[] = [];
  let availableCount = 0;

  for (const item of TRIAL_FIELD_CONTRACT_CATALOG) {
    if (item.status !== "typed-now") {
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
    totalFieldCount: TRIAL_FIELD_CONTRACT_CATALOG.length,
  };
}
