import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleTrialsResultsDesktopTable } from "../beagle-trials-results-desktop-table";

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

describe("BeagleTrialsResultsDesktopTable", () => {
  it("renders all summary fields in a compact row with a new-tab PDF action", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsResultsDesktopTable, {
        rows: [
          {
            trialId: "trial_1",
            pdfTrialEntryIds: ["entry 1", "entry-2"],
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
    expect(html).toContain("81.25");
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain(
      'href="/beagle/trials/pdf?trialEntryId=entry+1&amp;trialEntryId=entry-2"',
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('aria-label="trials.results.actions.pdf"');
  });
});
