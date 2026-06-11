import { describe, expect, it } from "vitest";
import {
  VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
  VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
  VIRTUAL_PAIRING_MIN_GENERATION_DEPTH,
  parseVirtualPairingGenerationDepth,
} from "../generation-depth";

describe("parseVirtualPairingGenerationDepth", () => {
  it("defaults missing or invalid values to SP 9 and clamps to the v1 range", () => {
    expect(parseVirtualPairingGenerationDepth(null)).toBe(
      VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
    );
    expect(parseVirtualPairingGenerationDepth(undefined)).toBe(
      VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
    );
    expect(parseVirtualPairingGenerationDepth(Number.NaN)).toBe(
      VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
    );
    expect(parseVirtualPairingGenerationDepth(3)).toBe(
      VIRTUAL_PAIRING_MIN_GENERATION_DEPTH,
    );
    expect(parseVirtualPairingGenerationDepth(4)).toBe(4);
    expect(parseVirtualPairingGenerationDepth(9)).toBe(9);
    expect(parseVirtualPairingGenerationDepth(12)).toBe(12);
    expect(parseVirtualPairingGenerationDepth(13)).toBe(
      VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
    );
  });
});
