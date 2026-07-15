import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogFilters } from "../dog-filters";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("DogFilters", () => {
  it("renders manual search actions with advanced filters collapsed", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogFilters, {
        query: "kide",
        sex: "FEMALE",
        status: "REFERENCE_ONLY",
        isPending: false,
        onQueryChange: vi.fn(),
        onSexChange: vi.fn(),
        onStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(html).toContain('value="kide"');
    expect(html).toContain("admin.dogs.filters.submit");
    expect(html).toContain("admin.dogs.filters.reset");
    expect(html).toContain("admin.dogs.filters.advanced.open");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("admin.dogs.filters.statusLabel");
    expect(html.indexOf('value="kide"')).toBeLessThan(
      html.indexOf("admin.dogs.filters.submit"),
    );
  });

  it("disables request actions while a search is pending", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogFilters, {
        query: "",
        sex: "all",
        status: "all",
        isPending: true,
        onQueryChange: vi.fn(),
        onSexChange: vi.fn(),
        onStatusChange: vi.fn(),
        onSubmit: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(html.match(/disabled=""/gu)).toHaveLength(2);
  });
});
