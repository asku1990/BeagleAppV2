import { describe, expect, it } from "vitest";
import { toTrialLegacyEventKey } from "../trial-event-identity-key";

describe("toTrialLegacyEventKey", () => {
  it("builds deterministic key from normalized event tuple", () => {
    const date = new Date(Date.UTC(2024, 0, 7));

    const key = toTrialLegacyEventKey({
      koepaiva: date,
      koekunta: "  Oulu  ",
      kennelpiiri: " Pohjois-Pohjanmaan   Kennelpiiri ",
      kennelpiirinro: " 08 ",
    });

    expect(key).toBe("2024-01-07|oulu|pohjois-pohjanmaan kennelpiiri|08");
  });

  it("keeps key stable when optional values are missing", () => {
    const key = toTrialLegacyEventKey({
      koepaiva: new Date(Date.UTC(2024, 8, 15)),
      koekunta: "Rovaniemi",
      kennelpiiri: null,
      kennelpiirinro: null,
    });

    expect(key).toBe("2024-09-15|rovaniemi||");
  });
});
