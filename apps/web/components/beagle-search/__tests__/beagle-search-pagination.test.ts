import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchPagination } from "../beagle-search-pagination";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("BeagleSearchPagination", () => {
  it("renders nothing when total is 0", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchPagination, {
        page: 1,
        total: 0,
        totalPages: 0,
        onPrevious: vi.fn(),
        onNext: vi.fn(),
      }),
    );

    expect(html).toBe("");
  });

  it("renders range and nav labels for paged results", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchPagination, {
        page: 2,
        total: 25,
        totalPages: 3,
        onPrevious: vi.fn(),
        onNext: vi.fn(),
      }),
    );

    expect(html).toContain("search.pagination.previous");
    expect(html).toContain("search.pagination.next");
    expect(html).toContain("search.pagination.range");
    expect(html).toContain("11-20 / 25");
  });
});
