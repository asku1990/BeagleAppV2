import { describe, expect, it } from "vitest";
import { validateLitterParents } from "../litter-parent-validation";

describe("validateLitterParents", () => {
  it("accepts a male sire and female dam", () => {
    expect(
      validateLitterParents(
        { id: "sire-1", sex: "MALE" },
        { id: "dam-1", sex: "FEMALE" },
      ),
    ).toBeNull();
  });

  it("rejects the same dog in both roles", () => {
    expect(
      validateLitterParents(
        { id: "dog-1", sex: "MALE" },
        { id: "dog-1", sex: "FEMALE" },
      ),
    ).toBe("INVALID_PARENT_COMBINATION");
  });

  it.each(["FEMALE", "UNKNOWN"] as const)(
    "rejects %s as the sire sex",
    (sex) => {
      expect(
        validateLitterParents(
          { id: "sire-1", sex },
          { id: "dam-1", sex: "FEMALE" },
        ),
      ).toBe("INVALID_SIRE_SEX");
    },
  );

  it.each(["MALE", "UNKNOWN"] as const)("rejects %s as the dam sex", (sex) => {
    expect(
      validateLitterParents(
        { id: "sire-1", sex: "MALE" },
        { id: "dam-1", sex },
      ),
    ).toBe("INVALID_DAM_SEX");
  });
});
