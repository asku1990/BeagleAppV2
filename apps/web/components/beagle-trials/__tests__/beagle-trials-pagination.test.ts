import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleTrialsPagination } from "../beagle-trials-pagination";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

type ElementProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  onChange?: (event: { target: { value: string } }) => void;
  "aria-current"?: string;
};

type TestElement = React.ReactElement<ElementProps>;

function asElements(node: React.ReactNode): TestElement[] {
  if (!node) {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => asElements(child));
  }
  if (!React.isValidElement<ElementProps>(node)) {
    return [];
  }
  return [node, ...asElements(node.props.children as React.ReactNode)];
}

describe("BeagleTrialsPagination", () => {
  it("renders nothing when total is 0", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsPagination, {
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

  it("renders range and navigation labels", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsPagination, {
        page: 2,
        pageSize: 10,
        total: 25,
        totalPages: 3,
        onPageSelect: vi.fn(),
        onPageSizeChange: vi.fn(),
      }),
    );

    expect(html).toContain("trials.pagination.previous");
    expect(html).toContain("trials.pagination.next");
    expect(html).toContain("trials.pagination.range 11-20 / 25");
    expect(html).toContain("trials.pagination.pageSize");
  });

  it("shows compact pagination with ellipsis on large sets", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsPagination, {
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
    const tree = BeagleTrialsPagination({
      page: 3,
      pageSize: 10,
      total: 100,
      totalPages: 10,
      onPageSelect,
      onPageSizeChange,
    });
    const elements = asElements(tree);

    const pageSizeSelect = elements.find(
      (element) => element.type === "select",
    );
    pageSizeSelect?.props.onChange?.({ target: { value: "25" } });

    const buttonElements = elements.filter(
      (element) => typeof element.props.onClick === "function",
    );
    const getText = (element: TestElement) => {
      const children = element.props.children;
      return Array.isArray(children) ? children.join("") : String(children);
    };

    buttonElements
      .find((button) => getText(button) === "trials.pagination.previous")
      ?.props.onClick?.();
    buttonElements
      .find((button) => getText(button) === "trials.pagination.next")
      ?.props.onClick?.();
    buttonElements
      .find((button) => button.props["aria-current"] === "page")
      ?.props.onClick?.();

    expect(onPageSizeChange).toHaveBeenCalledWith(25);
    expect(onPageSelect).toHaveBeenCalledWith(2);
    expect(onPageSelect).toHaveBeenCalledWith(4);
    expect(onPageSelect).toHaveBeenCalledWith(3);
  });
});
