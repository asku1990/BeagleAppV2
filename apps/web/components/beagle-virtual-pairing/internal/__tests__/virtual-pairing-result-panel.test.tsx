import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VirtualPairingResultPanel } from "../virtual-pairing-result-panel";

const t = (key: string) => key;

describe("VirtualPairingResultPanel", () => {
  it("shows a single legacy-style risk summary line", () => {
    const html = renderToStaticMarkup(
      React.createElement(VirtualPairingResultPanel, {
        t,
        showPositions: false,
        onShowPositionsChange: () => undefined,
        result: {
          generationDepth: 9,
          sire: {
            id: "sire",
            ekNo: 1,
            registrationNo: "FI12345/21",
            name: "Sire",
            sex: "U",
          },
          dam: {
            id: "dam",
            ekNo: 2,
            registrationNo: "FI54321/21",
            name: "Dam",
            sex: "N",
          },
          inbreedingCoefficientPct: 1.7821,
          rawInbreedingCoefficientPct: 1.7136,
          health: {
            epi: {
              value: 0.1563,
              text: "-----",
              tier: 1,
              display: "0.1563 -----",
            },
            risk: { value: 1, display: "1" },
          },
          summary: {
            sharedAncestorCount: 1,
            sharedOccurrenceCount: 2,
            includedOccurrenceCount: 2,
            includedSirePositionCount: 1,
            includedDamPositionCount: 1,
            includedPositionCount: 2,
            knownPedigreePct: 81.02,
            contributions: [
              {
                ancestorId: "anc",
                label: "Ancestor",
                contributionPct: 1.2345,
                rawContributionPct: 1.2345,
                occurrenceCount: 2,
                positions: [],
              },
            ],
          },
        },
      }),
    );

    expect(html).toContain("beagle.virtualPairing.result.health.summary");
    expect(html).toContain(
      "beagle.virtualPairing.result.sharedAncestors 1 kpl (2 kpl)",
    );
    expect(html).toContain("<label");
    expect(html).toContain("beagle.virtualPairing.result.positions");
    expect(html).toContain("epi-info");
    expect(html).not.toContain("0.1563");
    expect(html).not.toContain("EPI-riski (5 sp)");
    expect(html).not.toContain("Riskiluku(1-8)");
  });
});
