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
  it("links date and place while keeping PDF as a separate new-tab action", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsMobileCards, {
        rows: [
          {
            trialId: "show_1",
            pdfTrialEntryIds: ["entry_1", "entry_2"],
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 12,
            weather: { kind: "single", value: "L" },
            average: 81.25,
          },
        ],
      }),
    );

    expect(html).toContain("Helsinki");
    expect(html).toContain("Judge Main");
    expect(html).toContain("12");
    expect(html).toContain("81.25");
    expect(html).toContain("trials.results.weather.snow");
    expect(html).toContain('href="/beagle/trials/show_1"');
    expect(html.match(/<a /g)).toHaveLength(3);
    expect(html).toContain('href="/beagle/trials/show_1" class="');
    expect(html.match(/href="\/beagle\/trials\/show_1"/g)).toHaveLength(2);
    expect(html).toContain(
      'href="/beagle/trials/pdf?trialEntryId=entry_1&amp;trialEntryId=entry_2"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('aria-label="trials.results.actions.pdf"');
    expect(html).toContain('title="trials.results.actions.pdf"');
    expect(html).not.toContain("trials.results.open");
  });

  it("renders dash fallback when judge is missing", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsMobileCards, {
        rows: [
          {
            trialId: "show_2",
            pdfTrialEntryIds: [],
            eventDate: "2025-07-01",
            eventPlace: "Turku",
            judge: null,
            dogCount: 4,
            weather: { kind: "none" },
            average: null,
          },
        ],
      }),
    );

    expect(html).toContain("Turku");
    expect(html).toContain("trials.results.col.judge:");
    expect(html).toContain("-");
  });

  it("renders the varied weather label", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsMobileCards, {
        rows: [
          {
            trialId: "show_3",
            pdfTrialEntryIds: [],
            eventDate: "2025-08-01",
            eventPlace: "Oulu",
            judge: null,
            dogCount: 2,
            weather: { kind: "varied" },
            average: null,
          },
        ],
      }),
    );

    expect(html).toContain("trials.results.weather.varied");
  });
});
