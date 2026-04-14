import { describe, expect, it } from "vitest";
import {
  AJOK_MINIMUM_PRE_SWITCH_FIELDS,
  TRIAL_FIELD_CONTRACT_CATALOG,
  countTrialFieldContractStatuses,
} from "../trial-field-contract";

describe("TRIAL_FIELD_CONTRACT_CATALOG", () => {
  it("includes each AJOK target field exactly once", () => {
    const keys = TRIAL_FIELD_CONTRACT_CATALOG.map((item) => item.targetField);
    const unique = new Set(keys);

    expect(unique.size).toBe(keys.length);
  });

  it("keeps source field mapping strict by status", () => {
    for (const item of TRIAL_FIELD_CONTRACT_CATALOG) {
      if (item.status === "typed-now") {
        expect(item.sourceField).not.toBeNull();
      } else {
        expect(item.sourceField).toBeNull();
      }
    }
  });

  it("matches locked baseline status counts", () => {
    expect(countTrialFieldContractStatuses()).toEqual({
      "typed-now": 16,
      "raw-only": 8,
      missing: 26,
    });
  });

  it("contains minimum pre-switch fields in the catalog", () => {
    const targetFieldSet = new Set(
      TRIAL_FIELD_CONTRACT_CATALOG.map((item) => item.targetField),
    );

    for (const targetField of AJOK_MINIMUM_PRE_SWITCH_FIELDS) {
      expect(targetFieldSet.has(targetField)).toBe(true);
    }
  });
});
