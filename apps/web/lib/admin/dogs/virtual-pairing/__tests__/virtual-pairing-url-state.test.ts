import { describe, expect, it } from "vitest";
import {
  readVirtualPairingGenerationDepth,
  readVirtualPairingUrlState,
  toVirtualPairingQueryString,
} from "../virtual-pairing-url-state";

describe("virtual pairing URL state helpers", () => {
  it("defaults invalid or missing SP values to 9 and clamps the allowed range", () => {
    expect(readVirtualPairingGenerationDepth(null)).toBe(9);
    expect(readVirtualPairingGenerationDepth("")).toBe(9);
    expect(readVirtualPairingGenerationDepth("abc")).toBe(9);
    expect(readVirtualPairingGenerationDepth("3")).toBe(4);
    expect(readVirtualPairingGenerationDepth("12")).toBe(12);
    expect(readVirtualPairingGenerationDepth("13")).toBe(12);
  });

  it("reads sire, dam, and SP from query parameters", () => {
    const state = readVirtualPairingUrlState({
      get: (key: string) =>
        key === "sire"
          ? " FIN18665/07 "
          : key === "dam"
            ? " FIN12562/97 "
            : key === "sp"
              ? "7"
              : null,
    });

    expect(state).toEqual({
      sireRegistrationNo: "FIN18665/07",
      damRegistrationNo: "FIN12562/97",
      generationDepth: 7,
    });
  });

  it("serializes query params with URLSearchParams encoding", () => {
    expect(
      toVirtualPairingQueryString({
        sireRegistrationNo: "FIN18665/07",
        damRegistrationNo: "FIN12562/97",
        generationDepth: 12,
      }),
    ).toBe("sire=FIN18665%2F07&dam=FIN12562%2F97&sp=12");
  });
});
