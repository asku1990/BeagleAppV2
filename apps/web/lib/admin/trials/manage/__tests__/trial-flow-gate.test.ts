import { describe, expect, it } from "vitest";
import {
  AJOK_MINIMUM_PRE_SWITCH_FIELDS,
  TRIAL_FIELD_CONTRACT_CATALOG,
  type TrialFieldContractItem,
} from "../trial-field-contract";
import { evaluateTrialFlowGate } from "../trial-flow-gate";

describe("evaluateTrialFlowGate", () => {
  it("passes when all minimum required fields are typed-now", () => {
    const evaluation = evaluateTrialFlowGate();

    expect(evaluation.isReadyForReadSwitch).toBe(true);
    expect(evaluation.blockingFields).toEqual([]);
    expect(evaluation.minimumRequiredFields).toEqual(
      AJOK_MINIMUM_PRE_SWITCH_FIELDS,
    );
  });

  it("fails with deterministic blocking fields when a required field drifts", () => {
    const driftedCatalog: TrialFieldContractItem[] =
      TRIAL_FIELD_CONTRACT_CATALOG.map((item) => {
        if (
          item.targetField !== "koepaiva" &&
          item.targetField !== "sijoitus"
        ) {
          return item;
        }

        return {
          ...item,
          status: "missing",
          sourceField: null,
          followUpTicket: "BEJ-79",
        };
      });

    const evaluation = evaluateTrialFlowGate({
      catalog: driftedCatalog,
      minimumRequiredFields: ["sijoitus", "koepaiva"],
    });

    expect(evaluation.isReadyForReadSwitch).toBe(false);
    expect(evaluation.blockingFields.map((item) => item.targetField)).toEqual([
      "koepaiva",
      "sijoitus",
    ]);
  });

  it("updates status counts when statuses change in a fixture", () => {
    const driftedCatalog: TrialFieldContractItem[] =
      TRIAL_FIELD_CONTRACT_CATALOG.map((item) => {
        if (item.targetField !== "jarjestaja") {
          return item;
        }

        return {
          ...item,
          status: "missing",
          sourceField: null,
        };
      });

    const evaluation = evaluateTrialFlowGate({ catalog: driftedCatalog });

    expect(evaluation.statusCounts).toEqual({
      "typed-now": 47,
      "raw-only": 0,
      missing: 1,
    });
  });
});
