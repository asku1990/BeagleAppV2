import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchPagination } from "../beagle-search-pagination";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

function asElements(node: React.ReactNode): React.ReactElement[] {
  if (!node) {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => asElements(child));
  }
  if (!React.isValidElement(node)) {
    return [];
  }
  return [node, ...asElements(node.props.children as React.ReactNode)];
}

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

  it("invokes page and page-size callbacks", () => {
    const onPageSelect = vi.fn();
    const onPageSizeChange = vi.fn();
    const tree = BeagleSearchPagination({
      page: 3,
      pageSize: 10,
      total: 100,
      totalPages: 10,
      onPageSelect,
      onPageSizeChange,
    });
    const elements = asElements(tree);

    const pageSizeSelect = elements.find(
      (element) => React.isValidElement(element) && element.type === "select",
    );
    pageSizeSelect?.props.onChange({ target: { value: "25" } });

    const buttonElements = elements.filter(
      (element) => typeof element.props.onClick === "function",
    );
    const getText = (element: React.ReactElement) => {
      const children = element.props.children;
      return Array.isArray(children) ? children.join("") : String(children);
    };

    buttonElements
      .find((button) => getText(button) === "search.pagination.previous")
      ?.props.onClick();
    buttonElements
      .find((button) => getText(button) === "search.pagination.next")
      ?.props.onClick();
    buttonElements
      .find((button) => button.props["aria-current"] === "page")
      ?.props.onClick();

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageSelect).toHaveBeenCalledWith(2);
    expect(onPageSelect).toHaveBeenCalledWith(4);
    expect(onPageSelect).toHaveBeenCalledWith(3);
  });
});
