import { describe, expect, it } from "vitest";
import {
  formatClassResult,
  formatResultNotes,
  hasShowClassResult,
  hasShowResultNotes,
} from "../result-display";

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

describe("formatResultNotes", () => {
  it("joins pupn and awards when both are present", () => {
    expect(formatResultNotes({ pupn: "PU1", awards: ["SA", "ERI"] })).toBe(
      "PU1, SA, ERI",
    );
  });

  it("falls back to the available note field", () => {
    expect(formatResultNotes({ pupn: "PU1", awards: [] })).toBe("PU1");
    expect(formatResultNotes({ pupn: null, awards: ["SA"] })).toBe("SA");
    expect(formatResultNotes({ pupn: null, awards: [] })).toBe("-");
  });
});

describe("hasShowResultNotes", () => {
  it("detects either pupn or awards", () => {
    expect(
      hasShowResultNotes([
        { pupn: null, awards: [] },
        { pupn: "PU1", awards: [] },
      ]),
    ).toBe(true);
    expect(hasShowResultNotes([{ pupn: null, awards: [] }])).toBe(false);
  });
});
