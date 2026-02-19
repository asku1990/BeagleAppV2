import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchAdvancedFilters } from "../beagle-search-advanced-filters";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/form-fields", () => ({
  AdvancedFilterPanel: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  LabeledSelect: ({
    onChange,
    children,
  }: {
    onChange: (event: { target: { value: string } }) => void;
    children: React.ReactNode;
  }) => {
    onChange({ target: { value: "male" } });
    return React.createElement("select", null, children);
  },
  LabeledInput: ({
    onChange,
  }: {
    onChange: (event: { target: { value: string } }) => void;
  }) => {
    onChange({ target: { value: "2020" } });
    return React.createElement("input");
  },
  LabeledCheckbox: ({
    onChange,
  }: {
    onChange: (event: { target: { checked: boolean } }) => void;
  }) => {
    onChange({ target: { checked: true } });
    return React.createElement("input");
  },
}));

describe("BeagleSearchAdvancedFilters", () => {
  it("wires advanced filter callbacks", () => {
    const onSexChange = vi.fn();
    const onBirthYearFromChange = vi.fn();
    const onBirthYearToChange = vi.fn();
    const onEkOnlyChange = vi.fn();
    const onMultipleRegsOnlyChange = vi.fn();

    renderToStaticMarkup(
      React.createElement(BeagleSearchAdvancedFilters, {
        sex: "any",
        onSexChange,
        birthYearFrom: "",
        birthYearTo: "",
        onBirthYearFromChange,
        onBirthYearToChange,
        ekOnly: false,
        onEkOnlyChange,
        multipleRegsOnly: false,
        onMultipleRegsOnlyChange,
      }),
    );

    expect(onSexChange).toHaveBeenCalledWith("male");
    expect(onBirthYearFromChange).toHaveBeenCalledWith("2020");
    expect(onBirthYearToChange).toHaveBeenCalledWith("2020");
    expect(onEkOnlyChange).toHaveBeenCalledWith(true);
    expect(onMultipleRegsOnlyChange).toHaveBeenCalledWith(true);
  });
});
