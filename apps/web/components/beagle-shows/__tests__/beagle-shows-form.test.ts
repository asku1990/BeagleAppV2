import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleShowsForm } from "../beagle-shows-form";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  values: {
    mode: "year" as const,
    year: "",
    dateFrom: "",
    dateTo: "",
  },
  sort: "date-desc" as const,
  isPending: false,
  canSubmit: true,
  availableYears: [2025, 2024],
  onModeChange: vi.fn(),
  onYearChange: vi.fn(),
  onDateFromChange: vi.fn(),
  onDateToChange: vi.fn(),
  onSortChange: vi.fn(),
  onSubmit: vi.fn(),
  onReset: vi.fn(),
};

type ElementProps = {
  children?: React.ReactNode;
  placeholder?: string;
  onSubmit?: (event: { preventDefault: () => void }) => void;
  onChange?: (event: { target: { value: string } }) => void;
  onClick?: () => void;
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

describe("BeagleShowsForm", () => {
  it("renders year mode fields and sort options", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowsForm, baseProps),
    );

    expect(html).toContain("shows.form.title");
    expect(html).toContain("shows.form.mode.year");
    expect(html).toContain("shows.form.mode.range");
    expect(html).toContain('value="date-desc"');
    expect(html).toContain('value="date-asc"');
    expect(html).toContain('placeholder="shows.form.year.placeholder"');
    expect(html).toContain("shows.form.year.helper");
  });

  it("renders range date fields when mode is range", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleShowsForm, {
        ...baseProps,
        values: {
          mode: "range" as const,
          year: "",
          dateFrom: "2025-01-01",
          dateTo: "2025-01-31",
        },
      }),
    );

    expect(html).toContain("shows.form.dateFrom");
    expect(html).toContain("shows.form.dateTo");
    expect(html).toContain('type="date"');
  });

  it("invokes handlers for submit/reset/field changes", () => {
    const onModeChange = vi.fn();
    const onYearChange = vi.fn();
    const onSortChange = vi.fn();
    const onSubmit = vi.fn();
    const onReset = vi.fn();

    const tree = BeagleShowsForm({
      ...baseProps,
      onModeChange,
      onYearChange,
      onSortChange,
      onSubmit,
      onReset,
    });
    const elements = asElements(tree);

    const form = elements.find((element) => element.type === "form");
    form?.props.onSubmit?.({ preventDefault: vi.fn() });

    const selects = elements.filter((element) => element.type === "select");
    const sortSelect = selects[0];
    sortSelect?.props.onChange?.({ target: { value: "date-asc" } });

    const yearInput = elements.find(
      (element) => element.props.placeholder === "shows.form.year.placeholder",
    );
    yearInput?.props.onChange?.({ target: { value: "2025" } });

    const button = elements.find(
      (element) =>
        typeof element.props.onClick === "function" &&
        String(element.props.children) === "shows.form.reset",
    );
    button?.props.onClick?.();

    const yearRadio = elements.find(
      (element) =>
        element.type === "input" &&
        (element.props as { type?: string }).type === "radio",
    );
    yearRadio?.props.onChange?.({ target: { value: "year" } });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith("date-asc");
    expect(onYearChange).toHaveBeenCalledWith("2025");
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("year");
  });
});
