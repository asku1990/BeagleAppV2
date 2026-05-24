import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminVirtualPairingSearchPanel } from "../virtual-pairing-search-panel";

const t = (key: string) => key;

describe("AdminVirtualPairingSearchPanel", () => {
  it("renders name-first search controls and sex-specific selection buttons", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminVirtualPairingSearchPanel, {
        t,
        searchField: "name",
        searchText: "",
        searchEnabled: false,
        searchQuery: {
          isLoading: false,
          isError: false,
          error: null,
          data: {
            total: 3,
            items: [
              {
                id: "male",
                ekNo: null,
                registrationNo: "FI12345/21",
                name: "Male Dog",
                sex: "U",
              },
              {
                id: "female",
                ekNo: null,
                registrationNo: "FI54321/21",
                name: "Female Dog",
                sex: "N",
              },
              {
                id: "unknown",
                ekNo: null,
                registrationNo: "FI99999/21",
                name: "Unknown Dog",
                sex: "-",
              },
            ],
          },
        },
        onSearchFieldChange: vi.fn(),
        onSearchTextChange: vi.fn(),
        onSubmit: vi.fn(),
        onSelectParent: vi.fn(),
      }),
    );

    expect(html).toContain("admin.virtualPairing.search.field.name");
    expect(html).toContain("admin.virtualPairing.search.field.reg");
    expect(html).toContain("admin.virtualPairing.search.field.ek");
    expect(html.indexOf("admin.virtualPairing.search.field.name")).toBeLessThan(
      html.indexOf("admin.virtualPairing.search.field.reg"),
    );
    expect(html.indexOf("admin.virtualPairing.search.field.reg")).toBeLessThan(
      html.indexOf("admin.virtualPairing.search.field.ek"),
    );
    expect(html).toContain("Male Dog");
    expect(html).toContain("Female Dog");
    expect(html).toContain("Unknown Dog");
    expect(html).toContain("admin.dogs.sex.unknown");
    expect(html).toContain("admin.virtualPairing.search.selectSire");
    expect(html).toContain("admin.virtualPairing.search.selectDam");
    expect(
      html.match(/admin\.virtualPairing\.search\.selectSire/g)?.length ?? 0,
    ).toBe(1);
    expect(
      html.match(/admin\.virtualPairing\.search\.selectDam/g)?.length ?? 0,
    ).toBe(1);
  });
});
