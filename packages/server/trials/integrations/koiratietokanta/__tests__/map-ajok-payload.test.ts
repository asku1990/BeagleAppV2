import { describe, expect, it } from "vitest";
import { mapKoiratietokantaAjokPayload } from "../internal/map-ajok-payload";

describe("mapKoiratietokantaAjokPayload", () => {
  it("maps koekaudenkoe and pitkakoe into koetyyppi", () => {
    const kokokausiResult = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      koekaudenkoe: "1",
    });

    expect(kokokausiResult.ok).toBe(true);
    if (!kokokausiResult.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }

    expect(kokokausiResult.entry.koetyyppi).toBe("KOKOKAUDENKOE");

    const pitkakoeResult = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      pitkakoe: "1",
    });

    expect(pitkakoeResult.ok).toBe(true);
    if (!pitkakoeResult.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }

    expect(pitkakoeResult.entry.koetyyppi).toBe("PITKAKOE");
  });

  it("defaults koetyyppi to NORMAL and maps only SKLkoemuoto to entry koemuoto", () => {
    const result = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      SKLkoemuoto: "AJOK",
      KOEMUOTO: "A",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }

    expect(result.entry.koetyyppi).toBe("NORMAL");
    expect(result.entry.koemuoto).toBe("AJOK");
    expect(result.event).not.toHaveProperty("koemuoto");
  });

  it("rejects conflicting koetyyppi flags", () => {
    const result = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      koekaudenkoe: "1",
      pitkakoe: "1",
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected payload mapping to fail.");
    }

    expect(result.issues).toEqual([
      expect.objectContaining({
        field: "koekaudenkoe",
        code: "INVALID",
      }),
    ]);
  });

  it("maps top-level and per-era viite fields to huomautus text", () => {
    const result = mapKoiratietokantaAjokPayload({
      SKLid: 123,
      REKISTERINUMERO: "FI12345/21",
      Koepvm: "2026-03-01",
      KOEPAIKKA: "Helsinki",
      HUOMAUTUS: "Koira kävi tiellä.",
      VIITE: "Koettelupäivä lisätty.",
      I_VIITE: "Ensimmäisen erän huomautus.",
      II_VIITE: "Toisen erän huomautus.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected payload mapping to succeed.");
    }

    expect(result.entry.huomautusTeksti).toBe(
      "Koira kävi tiellä. Koettelupäivä lisätty.",
    );
    expect(result.eras).toEqual([
      expect.objectContaining({
        era: 1,
        huomautusTeksti: "Ensimmäisen erän huomautus.",
      }),
      expect.objectContaining({
        era: 2,
        huomautusTeksti: "Toisen erän huomautus.",
      }),
    ]);
  });
});
