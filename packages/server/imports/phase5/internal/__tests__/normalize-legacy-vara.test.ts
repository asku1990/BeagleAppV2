import { TrialEntryHuomautus } from "@beagle/db";
import { describe, expect, it } from "vitest";
import { normalizeLegacyVara } from "../normalize-legacy-vara";

describe("normalizeLegacyVara", () => {
  it.each([
    ["L", TrialEntryHuomautus.LUOPUI],
    ["L;;", TrialEntryHuomautus.LUOPUI],
    ["S", TrialEntryHuomautus.SULJETTU],
    ["S;;", TrialEntryHuomautus.SULJETTU],
    ["K", TrialEntryHuomautus.KESKEYTETTY],
    ["K;;", TrialEntryHuomautus.KESKEYTETTY],
  ])("maps %s to %s", (input, huomautus) => {
    expect(normalizeLegacyVara(input)).toEqual({
      huomautus,
      unknownRawValue: null,
    });
  });

  it.each([null, "", "   ", "NUL", ";;;", " ; ; ; "])(
    "maps empty legacy value %s to null",
    (input) => {
      expect(normalizeLegacyVara(input)).toEqual({
        huomautus: null,
        unknownRawValue: null,
      });
    },
  );

  it("returns unknown non-empty values for import warnings", () => {
    expect(normalizeLegacyVara("X;;")).toEqual({
      huomautus: null,
      unknownRawValue: "X;;",
    });
  });

  it.each(["L;K", "XK", "LS", "SLK"])(
    "treats ambiguous or contaminated legacy value %s as unknown",
    (input) => {
      expect(normalizeLegacyVara(input)).toEqual({
        huomautus: null,
        unknownRawValue: input,
      });
    },
  );
});
