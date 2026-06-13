import { describe, expect, it } from "vitest";
import {
  PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
  PUBLIC_VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
  PUBLIC_VIRTUAL_PAIRING_MIN_GENERATION_DEPTH,
  readPublicVirtualPairingGenerationDepth,
  readPublicVirtualPairingUrlState,
  toPublicVirtualPairingQueryHref,
} from "../virtual-pairing-url-state";

describe("public virtual pairing url state helpers", () => {
  it("reads and clamps generation depth", () => {
    expect(readPublicVirtualPairingGenerationDepth(null)).toBe(
      PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
    );
    expect(readPublicVirtualPairingGenerationDepth("foo")).toBe(
      PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
    );
    expect(readPublicVirtualPairingGenerationDepth("3")).toBe(
      PUBLIC_VIRTUAL_PAIRING_MIN_GENERATION_DEPTH,
    );
    expect(readPublicVirtualPairingGenerationDepth("9")).toBe(9);
    expect(readPublicVirtualPairingGenerationDepth("13")).toBe(
      PUBLIC_VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
    );
  });

  it("normalizes query params and builds hrefs", () => {
    const state = readPublicVirtualPairingUrlState({
      get: (key: string) => {
        if (key === "sire") return " fi12345/20 ";
        if (key === "dam") return " fi54321/18 ";
        if (key === "sp") return " 12 ";
        return null;
      },
    });

    expect(state).toEqual({
      sireRegistrationNo: "fi12345/20",
      damRegistrationNo: "fi54321/18",
      generationDepth: 12,
    });
    expect(
      toPublicVirtualPairingQueryHref("/beagle/virtual-pairing", state),
    ).toBe("/beagle/virtual-pairing?sire=fi12345%2F20&dam=fi54321%2F18&sp=12");
  });
});
