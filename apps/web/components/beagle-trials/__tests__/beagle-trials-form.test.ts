import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleTrialsForm } from "../beagle-trials-form";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  values: {
    mode: "season" as const,
    season: "",
    dateFrom: "",
    dateTo: "",
  },
  sort: "date-desc" as const,
  isPending: false,
  canSubmit: true,
  availableSeasons: ["2025-2026", "2024-2025"],
  onModeChange: vi.fn(),
  onSeasonChange: vi.fn(),
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

describe("BeagleTrialsForm", () => {
  it("renders season mode fields and sort options", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsForm, baseProps),
    );

    expect(html).toContain("trials.form.title");
    expect(html).toContain("trials.form.mode.season");
    expect(html).toContain("trials.form.mode.range");
    expect(html).toContain('value="date-desc"');
    expect(html).toContain('value="date-asc"');
    expect(html).toContain('value="2025-2026"');
    expect(html.match(/value="2025-2026"/g)).toHaveLength(1);
    expect(html).not.toContain("trials.form.season.latest");
  });

  it("renders range date fields when mode is range", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleTrialsForm, {
        ...baseProps,
        values: {
          mode: "range" as const,
          season: "",
          dateFrom: "2025-01-01",
          dateTo: "2025-01-31",
        },
      }),
    );

    expect(html).toContain("trials.form.dateFrom");
    expect(html).toContain("trials.form.dateTo");
    expect(html).toContain('type="date"');
  });

  it("invokes handlers for submit/reset/field changes", () => {
    const onModeChange = vi.fn();
    const onSeasonChange = vi.fn();
    const onSortChange = vi.fn();
    const onSubmit = vi.fn();
    const onReset = vi.fn();

    const tree = BeagleTrialsForm({
      ...baseProps,
      onModeChange,
      onSeasonChange,
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

    const seasonSelect = selects[1];
    seasonSelect?.props.onChange?.({ target: { value: "2025-2026" } });

    const button = elements.find(
      (element) =>
        typeof element.props.onClick === "function" &&
        String(element.props.children) === "trials.form.reset",
    );
    button?.props.onClick?.();

    const seasonRadio = elements.find(
      (element) =>
        element.type === "input" &&
        (element.props as { type?: string }).type === "radio",
    );
    seasonRadio?.props.onChange?.({ target: { value: "season" } });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSortChange).toHaveBeenCalledWith("date-asc");
    expect(onSeasonChange).toHaveBeenCalledWith("2025-2026");
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onModeChange).toHaveBeenCalledWith("season");
  });
});
