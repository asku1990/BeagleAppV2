import { describe, expect, it } from "vitest";
import { formatTrialAward } from "../format-trial-award";

describe("formatTrialAward", () => {
  it.each([
    ["1", null, null, "Beaj 1"],
    ["0", null, "KESKEYTETTY", "Beaj 0 (K)"],
    ["1", null, "KESKEYTETTY", "Beaj 1 (K)"],
    ["2", null, "KESKEYTETTY", "Beaj 2 (K)"],
    ["3", null, "KESKEYTETTY", "Beaj 3 (K)"],
    ["2", "A", "KESKEYTETTY", "Avo 2 (K)"],
    ["3", "V", "KESKEYTETTY", "Voi 3 (K)"],
    [null, null, "KESKEYTETTY", "Beaj K"],
    ["0", null, "SULJETTU", "Beaj S"],
    ["1", "V", "LUOPUI", "Voi L"],
    [null, null, null, null],
  ] as const)(
    "formats %s, %s, %s as %s",
    (award, classCode, huomautus, expected) => {
      expect(formatTrialAward(award, classCode, huomautus)).toBe(expected);
    },
  );
});
