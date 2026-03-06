import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleShowsResultsMobileCards } from "../beagle-shows-results-mobile-cards";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.ComponentProps<"a">) =>
    React.createElement("a", { href, ...props }, children),
}));

describe("BeagleShowsResultsMobileCards", () => {
  it("renders show card content with details link", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowsResultsMobileCards, {
        rows: [
          {
            showId: "show_1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 12,
          },
        ],
      }),
    );

    expect(html).toContain("Helsinki");
    expect(html).toContain("Judge Main");
    expect(html).toContain("12");
    expect(html).toContain("Avaa näyttely");
    expect(html).toContain('href="/beagle/shows/show_1"');
  });

  it("renders dash fallback when judge is missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowsResultsMobileCards, {
        rows: [
          {
            showId: "show_2",
            eventDate: "2025-07-01",
            eventPlace: "Turku",
            judge: null,
            dogCount: 4,
          },
        ],
      }),
    );

    expect(html).toContain("Turku");
    expect(html).toContain("Tuomari:");
    expect(html).toContain("-");
  });
});
