import { describe, expect, it } from "vitest";
import { createSeedDogProfile, getMockDogProfileById } from "../mock-profiles";
import { getDogProfileHref } from "../profile-route";

describe("beagle-dogs mock profile utilities", () => {
  it("resolves a profile by id in case-insensitive manner", () => {
    const result = getMockDogProfileById(" DOG_1 ");

    expect(result?.name).toBe("Ajometsän Aada");
  });

  it("returns null for unknown id", () => {
    expect(getMockDogProfileById("unknown")).toBeNull();
  });

  it("builds dog profile href by encoded id", () => {
    expect(getDogProfileHref("dog_1")).toBe("/beagle/dogs/dog_1");
    expect(getDogProfileHref("dog / id")).toBe("/beagle/dogs/dog%20%2F%20id");
  });

  it("builds seeded href and creates seed profile when fixed mock is missing", () => {
    const href = getDogProfileHref("x-10", {
      name: "Seed Dog",
      registrationNo: "FI-100/24",
      sex: "U",
      ekNo: 10,
      showCount: 2,
      trialCount: 1,
    });
    const seeded = createSeedDogProfile("x-10", {
      name: "Seed Dog",
      registrationNo: "FI-100/24",
      sex: "U",
      ekNo: 10,
      showCount: 2,
      trialCount: 1,
    });

    expect(href).toContain("/beagle/dogs/x-10?");
    expect(href).toContain("name=Seed+Dog");
    expect(seeded?.registrationNo).toBe("FI-100/24");
    expect(seeded?.shows).toHaveLength(2);
    expect(seeded?.trials).toHaveLength(1);
  });
});
