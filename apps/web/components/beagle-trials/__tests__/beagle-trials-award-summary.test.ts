import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleTrialsAwardSummary } from "../beagle-trials-award-summary";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

describe("BeagleTrialsAwardSummary", () => {
  it("renders both trial types with counts, percentages, and totals", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsAwardSummary, {
        summary: {
          dateFrom: "2005-08-20",
          dateTo: "2026-02-28",
          rows: [
            {
              trialType: "normal",
              first: { count: 3, percentage: 23.076923 },
              second: { count: 2, percentage: 15.384615 },
              third: { count: 1, percentage: 7.692307 },
              noPrize: { count: 4, percentage: 30.76923 },
              withdrew: { count: 1, percentage: 7.692307 },
              excluded: { count: 1, percentage: 7.692307 },
              awarded: { count: 6, percentage: 46.153846 },
              total: 13,
            },
            {
              trialType: "long",
              first: { count: 2, percentage: 50 },
              second: { count: 1, percentage: 25 },
              third: { count: 0, percentage: 0 },
              noPrize: { count: 1, percentage: 25 },
              withdrew: { count: 0, percentage: 0 },
              excluded: { count: 0, percentage: 0 },
              awarded: { count: 3, percentage: 75 },
              total: 4,
            },
          ],
        },
      }),
    );

    expect(html).toContain("trials.awardSummary.title");
    expect(html).toContain("trials.awardSummary.trialType.normal");
    expect(html).toContain("trials.awardSummary.trialType.long");
    expect(html).toContain("3 (23.08%)");
    expect(html).toContain("6 (46.15%)");
    expect(html).toContain(">13<");
    expect(html).toContain("20.8.2005");
    expect(html).toContain("28.2.2026");
  });

  it("renders nothing when the summary has no rows", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsAwardSummary, {
        summary: { dateFrom: null, dateTo: null, rows: [] },
      }),
    );

    expect(html).toBe("");
  });
});
