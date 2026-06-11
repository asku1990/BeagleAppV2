import { describe, expect, it } from "vitest";
import {
  INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
  getInbreedingAncestryLoadDepth,
} from "../inbreeding-ancestry-depth";

describe("getInbreedingAncestryLoadDepth", () => {
  it("loads the selected depth plus enough ancestry for default 9-generation dynamic shared-ancestor Fa", () => {
    expect(INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH).toBe(9);
    expect(getInbreedingAncestryLoadDepth(6)).toBe(14);
    expect(getInbreedingAncestryLoadDepth(9)).toBe(17);
  });
});
