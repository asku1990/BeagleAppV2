import { describe, expect, it } from "vitest";
import {
  calculateInbreedingCoefficientBreakdownForParentsPct,
  calculateInbreedingCoefficientForParentsPct,
  calculateInbreedingCoefficientPct,
} from "../inbreeding-coefficient";
import type { DogPedigreeAncestryDb } from "@beagle/db/dogs/core/pedigree-ancestry";

function makeAncestry(
  nodes: DogPedigreeAncestryDb["nodes"],
): DogPedigreeAncestryDb {
  return { rootId: "root", nodes };
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

  it("applies ancestor Fa multiplier from siitosasteProsentti", () => {
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
      13.75,
      5,
    );
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

  it("groups breakdown contributions by ancestor and applies ancestor Fa", () => {
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
      30.9375,
      5,
    );
  });
});
