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
        pageSize: 10,
        total: 0,
        totalPages: 0,
        onPageSelect: vi.fn(),
        onPageSizeChange: vi.fn(),
      }),
    );

    expect(html).toBe("");
  });

  it("renders range and nav labels for paged results", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchPagination, {
        page: 2,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        onPageSelect: vi.fn(),
        onPageSizeChange: vi.fn(),
      }),
    );

    expect(html).toContain("search.pagination.previous");
    expect(html).toContain("search.pagination.next");
    expect(html).toContain("search.pagination.range");
    expect(html).toContain("11-20 / 25");
    expect(html).toContain("search.pagination.pageSize");
  });

  it("renders compact pagination with ellipsis for large page counts", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchPagination, {
        page: 15,
        pageSize: 100,
        total: 34000,
        totalPages: 340,
        onPageSelect: vi.fn(),
        onPageSizeChange: vi.fn(),
      }),
    );

    expect(html).toContain('aria-current="page"');
    expect(html).toContain(">1<");
    expect(html).toContain(">14<");
    expect(html).toContain(">15<");
    expect(html).toContain(">16<");
    expect(html).toContain(">340<");
    expect(html).toContain("...");
  });
});
