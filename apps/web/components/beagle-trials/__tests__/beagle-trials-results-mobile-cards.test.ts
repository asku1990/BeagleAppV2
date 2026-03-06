import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleTrialsResultsMobileCards } from "../beagle-trials-results-mobile-cards";

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

describe("BeagleTrialsResultsMobileCards", () => {
  it("renders show card content with details link", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsMobileCards, {
        rows: [
          {
            trialId: "show_1",
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
    expect(html).toContain("trials.results.open");
    expect(html).toContain('href="/beagle/trials/show_1"');
  });

  it("renders dash fallback when judge is missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsMobileCards, {
        rows: [
          {
            trialId: "show_2",
            eventDate: "2025-07-01",
            eventPlace: "Turku",
            judge: null,
            dogCount: 4,
          },
        ],
      }),
    );

    expect(html).toContain("Turku");
    expect(html).toContain("trials.results.col.judge:");
    expect(html).toContain("-");
  });
});
