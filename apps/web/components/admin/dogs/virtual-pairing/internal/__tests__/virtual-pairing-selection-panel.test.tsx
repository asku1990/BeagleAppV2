import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AdminVirtualPairingSelectionPanel } from "../virtual-pairing-selection-panel";

const t = (key: string) => key;

describe("AdminVirtualPairingSelectionPanel", () => {
  it("renders generation depth options from 4 through 12", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingSelectionPanel, {
        t,
        selectedSire: null,
        selectedDam: null,
        generationDepth: "9",
        isCalculating: false,
        canCalculate: false,
        selectionMessage: null,
        calculationMessage: null,
        onGenerationDepthChange: () => undefined,
        onClearSire: () => undefined,
        onClearDam: () => undefined,
        onCalculate: () => undefined,
      }),
    );

    expect(html).toContain('value="4"');
    expect(html).toContain('value="12"');
  });
});
