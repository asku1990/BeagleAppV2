import {
  AJOK_FIELD_CONTRACT_VERSION,
  AJOK_MINIMUM_PRE_SWITCH_FIELDS,
  countTrialFieldContractStatuses,
  findTrialFieldContractItem,
  TRIAL_FIELD_CONTRACT_CATALOG,
  type TrialFieldContractItem,
  type TrialFieldContractStatusCounts,
} from "./trial-field-contract";

// Evaluates whether the locked BEJ-78 minimum field contract is satisfied.
// Used as a deterministic read-switch gate before moving to the new AJOK schema path.
export type TrialFlowGateBlockingField = {
  targetField: string;
  group: TrialFieldContractItem["group"];
  status: TrialFieldContractItem["status"];
  followUpTicket: TrialFieldContractItem["followUpTicket"];
};

export type TrialFlowGateEvaluation = {
  version: string;
  minimumRequiredFields: readonly string[];
  statusCounts: TrialFieldContractStatusCounts;
  isReadyForReadSwitch: boolean;
  blockingFields: TrialFlowGateBlockingField[];
};

function toBlockingField(
  item: TrialFieldContractItem,
): TrialFlowGateBlockingField {
  return {
    targetField: item.targetField,
    group: item.group,
    status: item.status,
    followUpTicket: item.followUpTicket,
  };
}

// Evaluates whether the minimum pre-switch AJOK contract is typed and safe for a UI read-path switch.
export function evaluateTrialFlowGate(options?: {
  catalog?: readonly TrialFieldContractItem[];
  minimumRequiredFields?: readonly string[];
}): TrialFlowGateEvaluation {
  const catalog = options?.catalog ?? TRIAL_FIELD_CONTRACT_CATALOG;
  const minimumRequiredFields =
    options?.minimumRequiredFields ?? AJOK_MINIMUM_PRE_SWITCH_FIELDS;

  const blockingFields: TrialFlowGateBlockingField[] = [];

  for (const targetField of minimumRequiredFields) {
    const item = findTrialFieldContractItem(targetField, catalog);
    if (!item) {
      throw new Error(
        `Unknown trial field contract targetField in minimum gate set: ${targetField}`,
      );
    }

    if (item.status !== "typed-now") {
      blockingFields.push(toBlockingField(item));
    }
  }

  blockingFields.sort((a, b) => a.targetField.localeCompare(b.targetField));

  return {
    version: AJOK_FIELD_CONTRACT_VERSION,
    minimumRequiredFields,
    statusCounts: countTrialFieldContractStatuses(catalog),
    isReadyForReadSwitch: blockingFields.length === 0,
    blockingFields,
  };
}
