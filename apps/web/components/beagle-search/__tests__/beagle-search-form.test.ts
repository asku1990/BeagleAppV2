import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchForm } from "../beagle-search-form";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const baseProps = {
  values: {
    ek: "",
    reg: "",
    name: "",
    sex: "any" as const,
    birthYearFrom: "",
    birthYearTo: "",
    ekOnly: false,
    multipleRegsOnly: false,
  },
  mode: "none" as const,
  sort: "name-asc" as const,
  advancedOpen: false,
  isPending: false,
  canSubmit: true,
  onFieldChange: vi.fn(),
  onSubmit: vi.fn(),
  onReset: vi.fn(),
  onToggleAdvanced: vi.fn(),
  onSortChange: vi.fn(),
  onSexChange: vi.fn(),
  onBirthYearFromChange: vi.fn(),
  onBirthYearToChange: vi.fn(),
  onEkOnlyChange: vi.fn(),
  onMultipleRegsOnlyChange: vi.fn(),
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

describe("BeagleSearchForm", () => {
  it("renders core fields and sort options including ek-asc", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchForm, baseProps),
    );

    expect(html).toContain("search.form.field.ek");
    expect(html).toContain("search.form.field.reg");
    expect(html).toContain("search.form.field.name");
    expect(html).toContain('value="ek-asc"');
    expect(html).toContain("search.form.mode.none");
  });

  it("shows advanced section and close toggle label when open", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchForm, {
        ...baseProps,
        advancedOpen: true,
        mode: "combined" as const,
      }),
    );

    expect(html).toContain("search.form.advanced.toggle.close");
    expect(html).toContain("search.form.advanced.title");
    expect(html).toContain("search.advanced.multipleRegsOnly");
    expect(html).toContain("search.form.mode.combined");
  });

  it("invokes handlers from form controls", () => {
    const onFieldChange = vi.fn();
    const onSubmit = vi.fn();
    const onReset = vi.fn();
    const onToggleAdvanced = vi.fn();
    const onSortChange = vi.fn();

    const tree = BeagleSearchForm({
      ...baseProps,
      onFieldChange,
      onSubmit,
      onReset,
      onToggleAdvanced,
      onSortChange,
    });
    const elements = asElements(tree);

    const form = elements.find((element) => element.type === "form");
    form?.props.onSubmit?.({
      preventDefault: vi.fn(),
    });

    const inputs = elements.filter((element) =>
      Boolean(element.props.placeholder),
    );
    const ekInput = inputs.find(
      (element) => element.props.placeholder === "search.form.field.ek",
    );
    const regInput = inputs.find(
      (element) => element.props.placeholder === "search.form.field.reg",
    );
    const nameInput = inputs.find(
      (element) => element.props.placeholder === "search.form.field.name",
    );
    ekInput?.props.onChange?.({ target: { value: "100" } });
    regInput?.props.onChange?.({ target: { value: "ABC" } });
    nameInput?.props.onChange?.({ target: { value: "Meri" } });

    const select = elements.find((element) => element.type === "select");
    select?.props.onChange?.({ target: { value: "ek-asc" } });

    const buttonTexts = elements
      .filter((element) => typeof element.props.onClick === "function")
      .map((element) => ({
        onClick: element.props.onClick as (() => void) | undefined,
        text: String(element.props.children ?? ""),
      }));
    buttonTexts
      .find((button) => button.text === "search.form.reset")
      ?.onClick?.();
    buttonTexts
      .find((button) => button.text.includes("advanced.toggle"))
      ?.onClick?.();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onFieldChange).toHaveBeenNthCalledWith(1, "ek", "100");
    expect(onFieldChange).toHaveBeenNthCalledWith(2, "reg", "ABC");
    expect(onFieldChange).toHaveBeenNthCalledWith(3, "name", "Meri");
    expect(onSortChange).toHaveBeenCalledWith("ek-asc");
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onToggleAdvanced).toHaveBeenCalledTimes(1);
  });
});
