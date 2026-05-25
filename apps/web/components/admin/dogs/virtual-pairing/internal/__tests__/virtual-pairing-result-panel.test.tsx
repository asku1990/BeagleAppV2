import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminVirtualPairingResultPanel } from "../virtual-pairing-result-panel";

const t = (key: string) => key;

describe("AdminVirtualPairingResultPanel", () => {
  it("renders contributions beyond the old 37 item cap", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingResultPanel, {
        t,
        result: {
          generationDepth: 12,
          sire: {
            id: "sire",
            ekNo: null,
            registrationNo: "FIN18665/07",
            name: "Sire Dog",
            sex: "U",
          },
          dam: {
            id: "dam",
            ekNo: null,
            registrationNo: "FIN12562/97",
            name: "Dam Dog",
            sex: "N",
          },
          inbreedingCoefficientPct: 1.2345,
          health: {
            epi: {
              value: 0.703,
              text: "-----",
              tier: 1,
              display: "0.703 -----",
            },
            lafora: {
              value: -1,
              display: "-1",
            },
            risk: {
              value: 1,
              display: "1",
            },
            pur: {
              value: 0.703,
              text: "-----",
              display: "0.703 -----",
            },
          },
          diagnostics: {
            sharedAncestorCount: 40,
            sharedOccurrenceCount: 90,
            includedOccurrenceCount: 70,
            includedSirePositionCount: 40,
            includedDamPositionCount: 40,
            includedPositionCount: 80,
            knownSlotCount: 80,
            knownPedigreePct: 50,
            contributions: Array.from({ length: 40 }, (_, index) => ({
              ancestorId: `ancestor-${index + 1}`,
              label: `Ancestor ${index + 1}`,
              contributionPct: 1,
              rawContributionPct: index === 0 ? 2 : 1,
              occurrenceCount: 1,
              displayPct: "1.00000 %",
              sireGeneration: 1,
              sireIndex: index + 1,
              damGeneration: 1,
              damIndex: index + 1,
            })),
          },
          placeholders: {
            diagnostics: { label: "Diagnostics", value: "Soon" },
            pedigree: { label: "Pedigree", value: "Soon" },
          },
        },
      }),
    );

    expect(html).toContain("Ancestor 37");
    expect(html).toContain("Ancestor 40");
    expect(html).toContain("1.2345 %");
    expect(html).toContain("41.0000 %");
    expect(html).toContain("1.00000 %");
    expect(html).toContain("admin.virtualPairing.result.health.epi:");
    expect(html).toContain("0.7030 -----");
    expect(html).toContain('data-epi-flag="green"');
    expect(html).toContain("=&gt; Vihreä(1)");
    expect(html).toContain("( 1 )");
    expect(html).toContain("admin.virtualPairing.result.health.lafora: -1");
    expect(html).toContain("admin.virtualPairing.result.health.risk: 1");
    expect(html).toContain(
      "admin.virtualPairing.result.health.pur: 0.703 -----",
    );
    expect(html).toContain(
      "admin.virtualPairing.result.summary.sharedAncestors 70 kpl (90 kpl)",
    );
    expect(html).toContain(
      "admin.virtualPairing.result.summary.occurrences 80 kpl (I=40 kpl, E=40 kpl)",
    );
    expect(html).toContain("text-sm font-medium text-muted-foreground");
  });
});
