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
});
