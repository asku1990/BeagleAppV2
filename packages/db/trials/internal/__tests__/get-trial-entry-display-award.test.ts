import { TrialEntryHuomautus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getTrialEntryDisplayAward } from "../get-trial-entry-display-award";

describe("getTrialEntryDisplayAward", () => {
  it.each([
    ["0", TrialEntryHuomautus.LUOPUI, "L"],
    ["0", TrialEntryHuomautus.SULJETTU, "S"],
    ["0", TrialEntryHuomautus.KESKEYTETTY, "K"],
    ["2", TrialEntryHuomautus.KESKEYTETTY, "2"],
    ["1", null, "1"],
  ] as const)("formats %s with %s as %s", (pa, huomautus, expected) => {
    expect(getTrialEntryDisplayAward(pa, huomautus)).toBe(expected);
  });
});
