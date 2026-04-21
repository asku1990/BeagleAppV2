import { describe, expect, it } from "vitest";
import { mapKoiratietokantaAjokPayload } from "../internal/map-ajok-payload";

describe("mapKoiratietokantaAjokPayload", () => {
  it("parses koekaudenkoe into kokokaudenkoe", () => {
    const result = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      koekaudenkoe: "1",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }

    expect(result.entry.kokokaudenkoe).toBe(true);
  });

  it("treats zero and missing values as false/null", () => {
    const zeroResult = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      koekaudenkoe: "0",
    });

    expect(zeroResult.ok).toBe(true);
    if (!zeroResult.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }
    expect(zeroResult.entry.kokokaudenkoe).toBe(false);

    const missingResult = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
    });

    expect(missingResult.ok).toBe(true);
    if (!missingResult.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }
    expect(missingResult.entry.kokokaudenkoe).toBeNull();
  });
});
