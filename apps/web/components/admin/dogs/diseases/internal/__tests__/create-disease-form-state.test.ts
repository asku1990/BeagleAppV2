import { describe, expect, it } from "vitest";
import { resolveCreateDiseaseSelectedCode } from "../create-disease-form-state";

describe("resolveCreateDiseaseSelectedCode", () => {
  it("keeps the current disease code when it exists", () => {
    expect(resolveCreateDiseaseSelectedCode("pur", "epi")).toBe("pur");
  });

  it("falls back to the browse selection when current code is missing", () => {
    expect(resolveCreateDiseaseSelectedCode(undefined, "pur")).toBe("pur");
    expect(resolveCreateDiseaseSelectedCode(null, "pur")).toBe("pur");
  });

  it("falls back to epi when neither code is available", () => {
    expect(resolveCreateDiseaseSelectedCode(undefined, undefined)).toBe("epi");
  });
});
