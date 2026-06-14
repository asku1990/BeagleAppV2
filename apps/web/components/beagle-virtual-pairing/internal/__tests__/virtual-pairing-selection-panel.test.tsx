import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VirtualPairingSelectionPanel } from "../virtual-pairing-selection-panel";

const t = (key: string) => key;

describe("VirtualPairingSelectionPanel", () => {
  it("renders selectable generation depths from 4 through 12", () => {
    const html = renderToStaticMarkup(
      React.createElement(VirtualPairingSelectionPanel, {
        t,
        sire: null,
        dam: null,
        generationDepth: "9",
        isCalculating: false,
        canCalculate: false,
        selectionMessage: null,
        calculationMessage: null,
        onClearSire: vi.fn(),
        onClearDam: vi.fn(),
        onGenerationDepthChange: vi.fn(),
        onCalculate: vi.fn(),
      }),
    );

    expect(html).toContain('value="4"');
    expect(html).toContain('value="12"');
    expect(html).toContain('value="9" selected');
    expect(html).not.toContain("beagle.virtualPairing.selected.swap");
  });
});
