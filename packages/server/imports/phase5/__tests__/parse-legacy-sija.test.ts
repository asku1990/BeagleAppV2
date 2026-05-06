import { describe, expect, it } from "vitest";
import { parseLegacySija } from "../internal/parse-legacy-sija";

describe("parseLegacySija", () => {
  it("maps normal placement rows", () => {
    expect(parseLegacySija("1|3")).toEqual({
      sija: "1",
      koiriaLuokassa: 3,
      koetyyppi: "NORMAL",
      unclear: false,
    });
  });

  it("maps pitkakoe rows", () => {
    expect(parseLegacySija("PK|4")).toEqual({
      sija: "PK",
      koiriaLuokassa: 4,
      koetyyppi: "PITKAKOE",
      unclear: false,
    });
  });

  it.each([
    ["PK|1", 1],
    ["PK|8", 8],
    ["Pk|1", 1],
    ["pk|2", 2],
    ["PK.1", 1],
    ["-|PK3", 3],
    ["-|PK4", 4],
  ])("preserves class count from observed pitkakoe value %s", (raw, count) => {
    expect(parseLegacySija(raw)).toEqual({
      sija: "PK",
      koiriaLuokassa: count,
      koetyyppi: "PITKAKOE",
      unclear: false,
    });
  });

  it("maps kokokaudenkoe rows", () => {
    expect(parseLegacySija("-|KK")).toEqual({
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: "KOKOKAUDENKOE",
      unclear: false,
    });

    expect(parseLegacySija("KK")).toEqual({
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: "KOKOKAUDENKOE",
      unclear: false,
    });
  });

  it("accepts common legacy separator variants", () => {
    expect(parseLegacySija("PK.1")).toEqual({
      sija: "PK",
      koiriaLuokassa: 1,
      koetyyppi: "PITKAKOE",
      unclear: false,
    });

    expect(parseLegacySija("7-9")).toEqual({
      sija: "7",
      koiriaLuokassa: 9,
      koetyyppi: "NORMAL",
      unclear: false,
    });

    expect(parseLegacySija("PK|-")).toEqual({
      sija: "PK",
      koiriaLuokassa: null,
      koetyyppi: "PITKAKOE",
      unclear: false,
    });

    expect(parseLegacySija("-|PK3")).toEqual({
      sija: "PK",
      koiriaLuokassa: 3,
      koetyyppi: "PITKAKOE",
      unclear: false,
    });
  });

  it("accepts dash-prefixed legacy forms", () => {
    expect(parseLegacySija("-")).toEqual({
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: "NORMAL",
      unclear: false,
    });

    expect(parseLegacySija("--3")).toEqual({
      sija: null,
      koiriaLuokassa: 3,
      koetyyppi: "NORMAL",
      unclear: false,
    });

    expect(parseLegacySija("-12")).toEqual({
      sija: null,
      koiriaLuokassa: 12,
      koetyyppi: "NORMAL",
      unclear: false,
    });
  });

  it("flags unclear values without failing", () => {
    expect(parseLegacySija("weird")).toEqual({
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: "NORMAL",
      unclear: true,
    });
  });
});
