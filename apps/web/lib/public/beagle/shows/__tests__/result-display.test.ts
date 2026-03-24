import { describe, expect, it } from "vitest";
import { formatClassResult, hasShowClassResult } from "../result-display";

describe("formatClassResult", () => {
  it("joins class code and placement", () => {
    expect(formatClassResult({ classCode: "JUN", classPlacement: 2 })).toBe(
      "JUN-2",
    );
  });

  it("falls back to whichever class field exists", () => {
    expect(formatClassResult({ classCode: "AVO", classPlacement: null })).toBe(
      "AVO",
    );
    expect(formatClassResult({ classCode: "   ", classPlacement: 2 })).toBe(
      "2",
    );
    expect(formatClassResult({ classCode: null, classPlacement: 1 })).toBe("1");
    expect(formatClassResult({ classCode: null, classPlacement: null })).toBe(
      "-",
    );
  });
});

describe("hasShowClassResult", () => {
  it("detects either class code or placement", () => {
    expect(
      hasShowClassResult([
        { classCode: null, classPlacement: null },
        { classCode: "JUN", classPlacement: null },
      ]),
    ).toBe(true);
    expect(
      hasShowClassResult([{ classCode: null, classPlacement: null }]),
    ).toBe(false);
  });
});
