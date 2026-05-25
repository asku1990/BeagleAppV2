import { describe, expect, it } from "vitest";
import type { DogPedigreeAncestryDb } from "@beagle/db/dogs/core/pedigree-ancestry";
import {
  calculateDogEpiSummary,
  calculateDogHealthSummary,
  getDogHealthDiseaseFactDogIds,
} from "../disease-summary";

function makeAncestry(
  nodes: DogPedigreeAncestryDb["nodes"],
): DogPedigreeAncestryDb {
  return { rootId: "virtual-root", nodes };
}

function makeNode(
  id: string,
  sireId: string | null,
  damId: string | null,
): DogPedigreeAncestryDb["nodes"][string] {
  return {
    id,
    sireId,
    damId,
    siitosasteProsentti: null,
  };
}

describe("calculateDogHealthSummary", () => {
  it("calculates EPI, Lafora, risk, and PUR summaries from current data", () => {
    const ancestry = makeAncestry({
      "virtual-root": makeNode("virtual-root", "sire", "dam"),
      sire: makeNode("sire", "sire-sire", "sire-dam"),
      dam: makeNode("dam", "dam-sire", "dam-dam"),
      "sire-sire": makeNode("sire-sire", null, null),
      "sire-dam": makeNode("sire-dam", null, null),
      "dam-sire": makeNode("dam-sire", null, null),
      "dam-dam": makeNode("dam-dam", null, null),
      "full-sibling": makeNode("full-sibling", "sire", "dam"),
      "half-sibling": makeNode("half-sibling", "sire", "other-dam"),
      "other-dam": makeNode("other-dam", null, null),
    });

    const summary = calculateDogHealthSummary("virtual-root", ancestry, [
      {
        dogId: "full-sibling",
        isaDogId: "sire",
        emaDogId: "dam",
        sairausKoodi: "epi",
      },
      {
        dogId: "half-sibling",
        isaDogId: "sire",
        emaDogId: "other-dam",
        sairausKoodi: "epi",
      },
      {
        dogId: "sire",
        isaDogId: "sire-sire",
        emaDogId: "sire-dam",
        sairausKoodi: "lepik",
      },
      {
        dogId: "dam",
        isaDogId: "dam-sire",
        emaDogId: "dam-dam",
        sairausKoodi: "lepis",
      },
      {
        dogId: "full-sibling",
        isaDogId: "sire",
        emaDogId: "dam",
        sairausKoodi: "pur",
      },
      {
        dogId: "half-sibling",
        isaDogId: "sire",
        emaDogId: "other-dam",
        sairausKoodi: "ap",
      },
    ]);

    expect(summary.epi).toEqual({
      value: 1.25,
      text: "-S--P",
      display: "1.250 -S--P",
      tier: 2,
    });
    expect(summary.lafora).toEqual({
      value: 5,
      display: "5",
    });
    expect(summary.risk).toEqual({
      value: 6,
      display: "6",
    });
    expect(summary.pur).toEqual({
      value: 1.25,
      text: "-S--P",
      display: "1.250 -S--P",
    });
  });

  it("ignores disease facts beyond the fixed five-generation depth", () => {
    const ancestry = makeAncestry({
      "virtual-root": makeNode("virtual-root", "sire", "dam"),
      sire: makeNode("sire", "sire-2", null),
      dam: makeNode("dam", null, null),
      "sire-2": makeNode("sire-2", "sire-3", null),
      "sire-3": makeNode("sire-3", "sire-4", null),
      "sire-4": makeNode("sire-4", "sire-5", null),
      "sire-5": makeNode("sire-5", "sire-6", null),
      "sire-6": makeNode("sire-6", null, null),
    });

    const summary = calculateDogHealthSummary("virtual-root", ancestry, [
      {
        dogId: "sire-6",
        isaDogId: null,
        emaDogId: null,
        sairausKoodi: "epi",
      },
      {
        dogId: "sire-6",
        isaDogId: null,
        emaDogId: null,
        sairausKoodi: "pur",
      },
    ]);

    expect(summary.epi.value).toBe(0);
    expect(summary.pur.value).toBe(0);
    expect(summary.epi.text).toBe("-----");
    expect(summary.pur.text).toBe("-----");
  });

  it("handles missing pedigree branches without throwing", () => {
    const summary = calculateDogHealthSummary(
      "virtual-root",
      makeAncestry({
        "virtual-root": makeNode("virtual-root", "sire", "dam"),
        sire: makeNode("sire", null, null),
      }),
      [],
    );

    expect(summary.epi.value).toBe(0);
    expect(summary.pur.value).toBe(0);
    expect(summary.lafora.value).toBe(0);
    expect(summary.risk.value).toBe(3);
  });
});

describe("getDogHealthDiseaseFactDogIds", () => {
  it("returns only the fixed five-generation health graph", () => {
    const ancestry = makeAncestry({
      "virtual-root": makeNode("virtual-root", "sire", "dam"),
      sire: makeNode("sire", "sire-2", null),
      dam: makeNode("dam", null, null),
      "sire-2": makeNode("sire-2", "sire-3", null),
      "sire-3": makeNode("sire-3", "sire-4", null),
      "sire-4": makeNode("sire-4", "sire-5", null),
      "sire-5": makeNode("sire-5", "sire-6", null),
      "sire-6": makeNode("sire-6", "outside-health", null),
      "outside-health": makeNode("outside-health", null, null),
    });

    expect(
      getDogHealthDiseaseFactDogIds("virtual-root", ancestry),
    ).toStrictEqual([
      "virtual-root",
      "sire",
      "dam",
      "sire-2",
      "sire-3",
      "sire-4",
      "sire-5",
    ]);
  });
});

describe("calculateDogEpiSummary", () => {
  it("keeps the legacy flat summary shape for admin profile callers", () => {
    const summary = calculateDogEpiSummary(
      "virtual-root",
      makeAncestry({
        "virtual-root": makeNode("virtual-root", "sire", "dam"),
      }),
      [],
    );

    expect(summary).toEqual({
      epiLuku: 0,
      epiTeksti: "-----",
      laforaLuku: 0,
      epiRiskLuku: 3,
    });
  });
});
