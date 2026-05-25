import { describe, expect, it } from "vitest";
import { getInbreedingAncestryLoadDepth } from "../inbreeding-ancestry-depth";

describe("getInbreedingAncestryLoadDepth", () => {
  it("loads the selected depth plus enough ancestry for dynamic shared-ancestor Fa", () => {
    expect(getInbreedingAncestryLoadDepth(6)).toBe(11);
    expect(getInbreedingAncestryLoadDepth(9)).toBe(17);
  });
});
