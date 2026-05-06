import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEventsFilters } from "../admin-trial-events-filters";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) =>
    React.createElement("input", props),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("button", props, children),
}));

describe("AdminTrialEventsFilters", () => {
  it("renders filters and validation state for year mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventsFilters, {
        mode: "year",
        query: "helsinki",
        yearInput: "2026x",
        dateFrom: "",
        dateTo: "",
        sort: "date-desc",
        filterError: "admin.trials.manage.filters.validation.year",
        onQueryChange: vi.fn(),
        onModeChange: vi.fn(),
        onYearInputChange: vi.fn(),
        onDateFromChange: vi.fn(),
        onDateToChange: vi.fn(),
        onSortChange: vi.fn(),
        onApply: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(html).toContain("admin.trials.manage.filters.placeholder");
    expect(html).toContain("admin.trials.manage.filters.mode.year");
    expect(html).toContain("admin.trials.manage.filters.sort.dateDesc");
    expect(html).toContain("admin.trials.manage.filters.validation.year");
    expect(html).toContain("disabled");
  });
});
