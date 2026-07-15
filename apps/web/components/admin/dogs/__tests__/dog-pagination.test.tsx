import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DogPagination } from "../dog-pagination";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

type TestElement = React.ReactElement<{
  children?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}>;

function asElements(node: React.ReactNode): TestElement[] {
  if (!node) {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((child) => asElements(child));
  }
  if (!React.isValidElement(node)) {
    return [];
  }
  const element = node as TestElement;
  return [element, ...asElements(element.props.children)];
}

describe("DogPagination", () => {
  it("renders nothing for a single page", () => {
    const html = renderToStaticMarkup(
      React.createElement(DogPagination, {
        page: 1,
        totalPages: 1,
        isPending: false,
        onPageChange: vi.fn(),
      }),
    );

    expect(html).toBe("");
  });

  it("renders the current page and navigates to adjacent pages", () => {
    const onPageChange = vi.fn();
    const tree = DogPagination({
      page: 2,
      totalPages: 4,
      isPending: false,
      onPageChange,
    });
    const elements = asElements(tree);
    const buttons = elements.filter(
      (element) => typeof element.props.onClick === "function",
    );

    buttons[0]?.props.onClick?.();
    buttons[1]?.props.onClick?.();

    expect(renderToStaticMarkup(tree)).toContain(
      "admin.dogs.pagination.page 2 / 4",
    );
    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("disables navigation at boundaries and while fetching", () => {
    const firstPage = asElements(
      DogPagination({
        page: 1,
        totalPages: 3,
        isPending: false,
        onPageChange: vi.fn(),
      }),
    ).filter((element) => typeof element.props.onClick === "function");
    const pendingPage = asElements(
      DogPagination({
        page: 2,
        totalPages: 3,
        isPending: true,
        onPageChange: vi.fn(),
      }),
    ).filter((element) => typeof element.props.onClick === "function");

    expect(firstPage[0]?.props.disabled).toBe(true);
    expect(firstPage[1]?.props.disabled).toBe(false);
    expect(pendingPage.every((button) => button.props.disabled)).toBe(true);
  });
});
