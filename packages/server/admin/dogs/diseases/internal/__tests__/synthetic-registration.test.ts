import { describe, expect, it } from "vitest";
import { isLegacySyntheticDiseaseRegistration } from "../synthetic-registration";

describe("isLegacySyntheticDiseaseRegistration", () => {
  it("accepts underscore synthetic registrations", () => {
    expect(isLegacySyntheticDiseaseRegistration("EPI_1/94", "epi")).toBe(true);
  });

  it("accepts compact synthetic registrations that match the disease code", () => {
    expect(isLegacySyntheticDiseaseRegistration("EPI1/94", "epi")).toBe(true);
  });

  it("treats regex metacharacters in the disease code as plain text", () => {
    expect(isLegacySyntheticDiseaseRegistration("A.B+1/94", "a.b+")).toBe(true);
    expect(isLegacySyntheticDiseaseRegistration("AXB+1/94", "a.b+")).toBe(
      false,
    );
  });

  it("rejects compact registrations when the disease code prefix is empty", () => {
    expect(isLegacySyntheticDiseaseRegistration("EPI1/94", "  ")).toBe(false);
  });
});
