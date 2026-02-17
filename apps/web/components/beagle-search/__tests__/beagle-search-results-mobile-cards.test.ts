import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchResultsMobileCards } from "../beagle-search-results-mobile-cards";

vi.mock("../beagle-search-row-actions", () => ({
  BeagleSearchRowActions: () =>
    React.createElement("div", null, "actions-mobile"),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("BeagleSearchResultsMobileCards", () => {
  it("renders card content, additional regs and male/female labels", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchResultsMobileCards, {
        rows: [
          {
            id: "d1",
            ekNo: 77,
            registrationNo: "FI-7/24",
            registrationNos: ["FI-7/24", "FI-9/25"],
            createdAt: "2026-01-01T00:00:00.000Z",
            sex: "N",
            name: "Meri",
            birthDate: null,
            sire: "Sire",
            dam: "Dam",
            trialCount: 5,
            showCount: 1,
          },
        ],
      }),
    );

    expect(html).toContain("FI-7/24");
    expect(html).toContain("FI-9/25");
    expect(html).toContain("search.results.sex.female");
    expect(html).toContain("Meri");
    expect(html).toContain("actions-mobile");
  });

  it("renders dash fallbacks for missing ek and unknown sex", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchResultsMobileCards, {
        rows: [
          {
            id: "d2",
            ekNo: null,
            registrationNo: "SE-1/24",
            registrationNos: ["SE-1/24"],
            createdAt: "2026-01-01T00:00:00.000Z",
            sex: "-",
            name: "Beta",
            birthDate: null,
            sire: "-",
            dam: "-",
            trialCount: 0,
            showCount: 0,
          },
        ],
      }),
    );

    expect(html).toContain("search.results.col.ek");
    expect(html).toContain("SE-1/24");
  });
});
