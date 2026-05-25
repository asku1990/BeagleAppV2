import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CalculateAdminVirtualPairingResponse } from "@beagle/contracts";
import { messages, type MessageKey } from "@/lib/i18n/messages";
import { AdminVirtualPairingResultPanel } from "../virtual-pairing-result-panel";

const t = (key: MessageKey) => key;

function buildResult(): CalculateAdminVirtualPairingResponse {
  return {
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
  };
}

describe("AdminVirtualPairingResultPanel", () => {
  it("renders contributions beyond the old 37 item cap", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingResultPanel, {
        t,
        result: buildResult(),
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

  it("renders known pedigree summary from Finnish and Swedish translations", () => {
    const result = buildResult();
    const fiHtml = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingResultPanel, {
        t: (key) => messages.fi[key],
        result,
      }),
    );
    const svHtml = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingResultPanel, {
        t: (key) => messages.sv[key],
        result,
      }),
    );

    expect(fiHtml).toContain("12-polven sukutaulusta tiedossa 50.00 %");
    expect(svHtml).toContain("12 generationers stamtavla känd 50.00 %");
  });
});
