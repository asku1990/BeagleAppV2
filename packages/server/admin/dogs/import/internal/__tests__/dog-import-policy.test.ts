import { describe, expect, it } from "vitest";
import { issueFromDogImportFact } from "../issues/dog-import-issues";
import {
  DOG_IMPORT_POLICY_DEFAULTS,
  DOG_IMPORT_POLICY_VERSION,
} from "../policy/dog-import-policy";
import { compareWithoutClearing } from "../policy/no-clearing-comparison";

describe("dog import policy", () => {
  it("converts facts using the default policy", () => {
    expect(
      issueFromDogImportFact({
        code: "DOG_COLOR_DIFFERS",
        field: "colorName",
        currentValue: "Black",
        incomingValue: "Tan",
      }),
    ).toMatchObject({
      severity: "WARNING",
      resolution: "AUTO_UPDATE",
      overridable: true,
    });
    expect(DOG_IMPORT_POLICY_VERSION).toBe("1");
  });

  it("marks integrity rules as non-overridable", () => {
    expect(DOG_IMPORT_POLICY_DEFAULTS.REGISTRATION_INVALID.overridable).toBe(
      false,
    );
    expect(DOG_IMPORT_POLICY_DEFAULTS.DOG_NAME_CONFLICT.overridable).toBe(true);
  });

  it("does not clear an existing value from an empty source", () => {
    expect(
      compareWithoutClearing({
        field: "tailText",
        code: "DOG_TAIL_DIFFERS",
        currentValue: "long",
        incomingValue: "",
      }),
    ).toMatchObject({
      code: "SOURCE_EMPTY_PRESERVED",
      severity: "INFO",
      resolution: "KEEP_EXISTING",
    });
    expect(
      compareWithoutClearing({
        field: "tailText",
        code: "DOG_TAIL_DIFFERS",
        currentValue: "",
        incomingValue: "",
      }),
    ).toBeNull();
  });
});
