import { describe, expect, it } from "vitest";
import type { DogPedigreeAncestryDb } from "@beagle/db/dogs/core/pedigree-ancestry";
import {
  calculateInbreedingCoefficientBreakdownForParentsPct,
  calculateInbreedingCoefficientForParentsPct,
  calculateInbreedingCoefficientPct,
} from "../inbreeding-coefficient";

function makeAncestry(
  nodes: DogPedigreeAncestryDb["nodes"],
): DogPedigreeAncestryDb {
  return { rootId: "root", nodes };
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

function buildCompleteTree(
  rootId: string,
  maxDepth: number,
): DogPedigreeAncestryDb["nodes"] {
  const nodes: DogPedigreeAncestryDb["nodes"] = {};

  const visit = (id: string, generation: number) => {
    if (generation >= maxDepth) {
      nodes[id] = makeNode(id, null, null);
      return;
    }

    const sireId = `${id}-s`;
    const damId = `${id}-d`;
    visit(sireId, generation + 1);
    visit(damId, generation + 1);
    nodes[id] = makeNode(id, sireId, damId);
  };

  visit(rootId, 1);
  return nodes;
}

describe("calculateInbreedingCoefficientPct", () => {
  it("returns null when either parent is missing", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: null,
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).toBeNull();
  });

  it("returns zero for unrelated parents", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "sire-parent",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: null,
        damId: "dam-parent",
        siitosasteProsentti: null,
      },
      "sire-parent": {
        id: "sire-parent",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
      "dam-parent": {
        id: "dam-parent",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).toBe(0);
  });

  it("calculates a shared ancestor path", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      ancestor: {
        id: "ancestor",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).toBeCloseTo(
      12.5,
      5,
    );
  });

  it("calculates from a virtual parent pair", () => {
    const ancestry = makeAncestry({
      sire: {
        id: "sire",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      ancestor: {
        id: "ancestor",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(
      calculateInbreedingCoefficientForParentsPct("sire", "dam", ancestry),
    ).toBeCloseTo(12.5, 5);
  });

  it("accumulates multiple shared ancestor paths", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "ancestor-a",
        damId: "ancestor-b",
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor-a",
        damId: "ancestor-b",
        siitosasteProsentti: null,
      },
      "ancestor-a": {
        id: "ancestor-a",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
      "ancestor-b": {
        id: "ancestor-b",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).toBeCloseTo(
      25,
      5,
    );
  });

  it("does not throw when a cycle is encountered", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "root",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: { id: "dam", sireId: null, damId: null, siitosasteProsentti: null },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).not.toBeNull();
  });

  it("ignores stored ancestor siitosasteProsentti values", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      ancestor: {
        id: "ancestor",
        sireId: null,
        damId: null,
        siitosasteProsentti: 10,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry)).toBeCloseTo(
      12.5,
      5,
    );
  });

  it("applies ancestor Fa multiplier from dynamically calculated inbreeding", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      ancestor: {
        id: "ancestor",
        sireId: "ancestor-sire",
        damId: "ancestor-dam",
        siitosasteProsentti: 99,
      },
      "ancestor-sire": {
        id: "ancestor-sire",
        sireId: "deep-shared",
        damId: null,
        siitosasteProsentti: null,
      },
      "ancestor-dam": {
        id: "ancestor-dam",
        sireId: "deep-shared",
        damId: null,
        siitosasteProsentti: null,
      },
      "deep-shared": {
        id: "deep-shared",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry, 3)).toBeCloseTo(
      14.0625,
      5,
    );
  });

  it("uses default 9-generation ancestor Fa independently from selected pair depth", () => {
    const ancestry = makeAncestry({
      root: {
        id: "root",
        sireId: "sire",
        damId: "dam",
        siitosasteProsentti: null,
      },
      sire: {
        id: "sire",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "ancestor",
        damId: null,
        siitosasteProsentti: null,
      },
      ancestor: {
        id: "ancestor",
        sireId: "ancestor-sire",
        damId: "ancestor-dam",
        siitosasteProsentti: null,
      },
      "ancestor-sire": {
        id: "ancestor-sire",
        sireId: "ancestor-sire-parent",
        damId: null,
        siitosasteProsentti: null,
      },
      "ancestor-dam": {
        id: "ancestor-dam",
        sireId: "ancestor-dam-parent",
        damId: null,
        siitosasteProsentti: null,
      },
      "ancestor-sire-parent": {
        id: "ancestor-sire-parent",
        sireId: "deep-shared",
        damId: null,
        siitosasteProsentti: null,
      },
      "ancestor-dam-parent": {
        id: "ancestor-dam-parent",
        sireId: "deep-shared",
        damId: null,
        siitosasteProsentti: null,
      },
      "deep-shared": {
        id: "deep-shared",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(calculateInbreedingCoefficientPct("root", ancestry, 2)).toBeCloseTo(
      12.890625,
      5,
    );
    expect(
      calculateInbreedingCoefficientPct("root", ancestry, 2, {
        ancestorInbreedingDepth: 2,
      }),
    ).toBeCloseTo(12.5, 5);
  });

  it("reports legacy-compatible included side-position counts", () => {
    const ancestry = makeAncestry({
      sire: {
        id: "sire",
        sireId: "shared-a",
        damId: "shared-b",
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "shared-a",
        damId: "shared-b",
        siitosasteProsentti: null,
      },
      "shared-a": {
        id: "shared-a",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
      "shared-b": {
        id: "shared-b",
        sireId: null,
        damId: null,
        siitosasteProsentti: null,
      },
    });

    expect(
      calculateInbreedingCoefficientBreakdownForParentsPct(
        "sire",
        "dam",
        ancestry,
        2,
      ),
    ).toMatchObject({
      sharedAncestorCount: 2,
      sharedOccurrenceCount: 2,
      includedOccurrenceCount: 2,
      includedSirePositionCount: 2,
      includedDamPositionCount: 2,
      includedPositionCount: 4,
    });
  });

  it("groups breakdown contributions by ancestor without stored ancestor Fa", () => {
    const ancestry = makeAncestry({
      sire: {
        id: "sire",
        sireId: "shared",
        damId: "sire-dam",
        siitosasteProsentti: null,
      },
      dam: {
        id: "dam",
        sireId: "shared",
        damId: "dam-dam",
        siitosasteProsentti: null,
      },
      "sire-dam": {
        id: "sire-dam",
        sireId: "shared",
        damId: null,
        siitosasteProsentti: null,
      },
      "dam-dam": {
        id: "dam-dam",
        sireId: "shared",
        damId: null,
        siitosasteProsentti: null,
      },
      shared: {
        id: "shared",
        sireId: null,
        damId: null,
        siitosasteProsentti: 10,
      },
    });

    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      "sire",
      "dam",
      ancestry,
      3,
    );

    expect(breakdown.contributions).toHaveLength(1);
    expect(breakdown.contributions[0]).toMatchObject({
      id: "shared",
      occurrenceCount: 4,
    });
    expect(breakdown.contributions[0]?.rawContributionPct).toBeCloseTo(
      28.125,
      5,
    );
    expect(breakdown.contributions[0]?.adjustedContributionPct).toBeCloseTo(
      28.125,
      5,
    );
  });

  it("counts the full SP4 pedigree slots including the selected sire and dam", () => {
    const ancestry = makeAncestry({
      ...buildCompleteTree("sire", 4),
      ...buildCompleteTree("dam", 4),
    });

    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      "sire",
      "dam",
      ancestry,
      4,
    );

    expect(breakdown.knownSlotCount).toBe(30);
    expect(breakdown.knownPedigreePct).toBeCloseTo(100, 5);
  });

  it("counts only the selected sire and dam when no parents are known", () => {
    const ancestry = makeAncestry({
      sire: makeNode("sire", null, null),
      dam: makeNode("dam", null, null),
    });

    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      "sire",
      "dam",
      ancestry,
      4,
    );

    expect(breakdown.knownSlotCount).toBe(2);
    expect(breakdown.knownPedigreePct).toBeCloseTo(6.6666666667, 5);
  });

  it("counts pedigree slots rather than unique ancestors in a partially missing SP3 pedigree", () => {
    const ancestry = makeAncestry({
      sire: makeNode("sire", "shared", "shared"),
      dam: makeNode("dam", "shared", "dam-parent"),
      shared: makeNode("shared", null, null),
      "dam-parent": makeNode("dam-parent", null, null),
    });

    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      "sire",
      "dam",
      ancestry,
      3,
    );

    expect(Object.keys(ancestry.nodes)).toHaveLength(4);
    expect(breakdown.knownSlotCount).toBe(6);
    expect(breakdown.knownPedigreePct).toBeCloseTo(42.8571428571, 5);
  });

  it("uses the full SP9 denominator when only the selected pair is known", () => {
    const ancestry = makeAncestry({
      sire: makeNode("sire", null, null),
      dam: makeNode("dam", null, null),
    });

    const breakdown = calculateInbreedingCoefficientBreakdownForParentsPct(
      "sire",
      "dam",
      ancestry,
      9,
    );

    expect(breakdown.knownSlotCount).toBe(2);
    expect(breakdown.knownPedigreePct).toBeCloseTo(0.1956947162, 5);
  });
});
