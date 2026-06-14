import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { VirtualPairingSearchPanel } from "../virtual-pairing-search-panel";

const t = (key: string) => key;

describe("VirtualPairingSearchPanel", () => {
  it("disables invalid parent actions by sex", () => {
    const html = renderToStaticMarkup(
      React.createElement(VirtualPairingSearchPanel, {
        t,
        field: "name",
        query: "kide",
        isPending: false,
        canSubmit: true,
        results: {
          field: "name",
          query: "kide",
          total: 2,
          totalPages: 1,
          page: 1,
          isLimited: false,
          candidateLimit: null,
          items: [
            {
              id: "male",
              ekNo: null,
              registrationNo: "FI12345/21",
              name: "Male Dog",
              sex: "U",
              trialCount: 0,
              showCount: 0,
            },
            {
              id: "female",
              ekNo: null,
              registrationNo: "FI54321/21",
              name: "Female Dog",
              sex: "N",
              trialCount: 0,
              showCount: 0,
            },
            {
              id: "unknown",
              ekNo: null,
              registrationNo: "FI99999/21",
              name: "Unknown Dog",
              sex: "-",
              trialCount: 0,
              showCount: 0,
            },
          ],
        },
        hasCommittedSearch: true,
        isLoading: false,
        isError: false,
        errorMessage: null,
        onFieldChange: vi.fn(),
        onQueryChange: vi.fn(),
        onSubmit: vi.fn(),
        onSelectSire: vi.fn(),
        onSelectDam: vi.fn(),
      }),
    );

    expect(html).toContain("Male Dog");
    expect(html).toContain("Female Dog");
    expect(html).toContain("Unknown Dog");

    const tbody = html.match(/<tbody>([\s\S]*)<\/tbody>/)?.[1] ?? "";
    const rowChunks = [...tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(
      (match) => match[1],
    );
    const buttons = (chunk: string) =>
      [...chunk.matchAll(/<button([^>]*)>([\s\S]*?)<\/button>/g)].map(
        (match) => ({
          attrs: match[1],
          text: match[2],
        }),
      );
    const hasDisabledAttr = (attrs: string | undefined) =>
      /(?:^|\s)disabled(?:=|\s|$)/.test(attrs ?? "");

    expect(rowChunks).toHaveLength(3);

    const maleButtons = buttons(rowChunks[0] ?? "");
    expect(maleButtons[0]?.text).toContain(
      "beagle.virtualPairing.search.selectSire",
    );
    expect(hasDisabledAttr(maleButtons[0]?.attrs)).toBe(false);
    expect(maleButtons[1]?.text).toContain(
      "beagle.virtualPairing.search.selectDam",
    );
    expect(hasDisabledAttr(maleButtons[1]?.attrs)).toBe(true);

    const femaleButtons = buttons(rowChunks[1] ?? "");
    expect(femaleButtons[0]?.text).toContain(
      "beagle.virtualPairing.search.selectSire",
    );
    expect(hasDisabledAttr(femaleButtons[0]?.attrs)).toBe(true);
    expect(femaleButtons[1]?.text).toContain(
      "beagle.virtualPairing.search.selectDam",
    );
    expect(hasDisabledAttr(femaleButtons[1]?.attrs)).toBe(false);

    const unknownButtons = buttons(rowChunks[2] ?? "");
    expect(hasDisabledAttr(unknownButtons[0]?.attrs)).toBe(true);
    expect(hasDisabledAttr(unknownButtons[1]?.attrs)).toBe(true);
  });
});
