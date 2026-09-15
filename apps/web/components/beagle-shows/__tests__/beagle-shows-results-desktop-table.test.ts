import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleShowsResultsDesktopTable } from "../beagle-shows-results-desktop-table";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

describe("BeagleShowsResultsDesktopTable", () => {
  it("renders the city column and its missing value fallback", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowsResultsDesktopTable, {
        rows: [
          {
            showId: "show_1",
            eventDate: "2025-06-01",
            eventCity: "Espoo",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 12,
          },
          {
            showId: "show_2",
            eventDate: "2025-07-01",
            eventCity: null,
            eventPlace: "Turku",
            judge: null,
            dogCount: 4,
          },
        ],
      }),
    );

    expect(html).toContain("shows.results.col.city");
    expect(html).toContain("Espoo");
    expect(html).toContain(">-</td>");
  });
});
