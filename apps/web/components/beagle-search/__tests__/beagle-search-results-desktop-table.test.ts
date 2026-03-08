import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchResultsDesktopTable } from "../beagle-search-results-desktop-table";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("BeagleSearchResultsDesktopTable", () => {
  it("renders row values with additional registrations and sex labels", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchResultsDesktopTable, {
        rows: [
          {
            id: "d1",
            ekNo: 11,
            registrationNo: "FI-11/24",
            registrationNos: ["FI-11/24", "FI-22/25"],
            createdAt: "2026-01-01T00:00:00.000Z",
            sex: "U",
            name: "Alpha",
            birthDate: null,
            sire: "Sire",
            dam: "Dam",
            trialCount: 3,
            showCount: 4,
          },
        ],
      }),
    );

    expect(html).toContain("FI-11/24");
    expect(html).toContain("FI-22/25");
    expect(html).toContain("search.results.col.regAll");
    expect(html).toContain("search.results.sex.male");
    expect(html).toContain("Alpha");
    expect(html).toContain('href="/beagle/dogs/d1"');
    expect(html.indexOf("search.results.col.reg")).toBeLessThan(
      html.indexOf("search.results.col.name"),
    );
    expect(html.indexOf("search.results.col.name")).toBeLessThan(
      html.indexOf("search.results.col.ek"),
    );
  });

  it("renders dash fallback for missing ek/unknown sex", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchResultsDesktopTable, {
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

    expect(html).toContain('<td class="px-2 py-2">-</td>');
  });
});
