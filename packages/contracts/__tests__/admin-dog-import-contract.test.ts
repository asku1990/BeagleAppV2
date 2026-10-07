import { describe, expect, it } from "vitest";
import type { DogImportIssue } from "../admin/dogs/import";

describe("admin dog import contract", () => {
  it("keeps the stable issue shape typed", () => {
    const issue: DogImportIssue = {
      code: "DOG_COLOR_DIFFERS",
      severity: "WARNING",
      field: "colorName",
      registrationNo: "FI123",
      sourceRowNumber: 2,
      currentValue: null,
      incomingValue: "Tricolor",
      message: "Color differs",
      resolution: "AUTO_UPDATE",
      overridable: true,
    };
    expect(issue.code).toBe("DOG_COLOR_DIFFERS");
  });
});
