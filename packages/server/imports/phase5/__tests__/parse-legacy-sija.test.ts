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
      sija: null,
      koiriaLuokassa: 4,
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
