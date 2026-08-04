import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEraDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { resolveResultCreateFieldSet } from "@/lib/admin/trials/result-create-field-registry";
import { EraSection } from "../era-section";

describe("EraSection", () => {
  it("uses the current-era Ajotaito label only in verified creation", () => {
    const props = {
      eras: [createEmptyEraDraft(1)],
      isPending: false,
      onAddEra: vi.fn(),
      onRemoveEra: vi.fn(),
      onChangeEraField: vi.fn(),
    };
    const verifiedFieldSet = resolveResultCreateFieldSet("trw_post_20230801");

    const createHtml = renderToStaticMarkup(
      React.createElement(EraSection, {
        ...props,
        visibleFields: verifiedFieldSet.eraFields,
        yvaLabel: verifiedFieldSet.yvaLabels?.era,
      }),
    );
    const editHtml = renderToStaticMarkup(
      React.createElement(EraSection, props),
    );
    const fallbackFieldSet = resolveResultCreateFieldSet(null);
    const fallbackHtml = renderToStaticMarkup(
      React.createElement(EraSection, {
        ...props,
        visibleFields: fallbackFieldSet.eraFields,
        yvaLabel: fallbackFieldSet.yvaLabels?.era,
      }),
    );

    expect(createHtml).toContain("ajotaito");
    expect(createHtml).not.toContain("ajotaito / yleisvaikutelma");
    expect(editHtml).toContain("ajotaito / yleisvaikutelma");
    expect(fallbackHtml).toContain("ajotaito / yleisvaikutelma");
    expect(fallbackHtml).toContain("tie ja estetyöskentely");
    expect(fallbackHtml).toContain("metsästysinto");
  });

  it("renders only the era fields resolved for a presentation domain", () => {
    const props = {
      eras: [createEmptyEraDraft(1)],
      isPending: false,
      onAddEra: vi.fn(),
      onRemoveEra: vi.fn(),
      onChangeEraField: vi.fn(),
      showControls: false,
      showHeading: false,
    };
    const fieldSet = resolveResultCreateFieldSet("trw_post_20230801");
    const groups = Object.fromEntries(
      fieldSet.presentationGroups.map((group) => [
        group.id,
        new Set(group.eraFields),
      ]),
    );
    const timeHtml = renderToStaticMarkup(
      React.createElement(EraSection, {
        ...props,
        visibleFields: groups.time,
      }),
    );
    const meritHtml = renderToStaticMarkup(
      React.createElement(EraSection, {
        ...props,
        visibleFields: groups.merit,
        yvaLabel: fieldSet.yvaLabels?.era,
      }),
    );

    expect(timeHtml).toContain("alkoi");
    expect(timeHtml).toContain("hakumin");
    expect(timeHtml).toContain("ajomin");
    expect(timeHtml).not.toContain("haukku");
    expect(meritHtml).toContain("haku");
    expect(meritHtml).toContain("haukku");
    expect(meritHtml).toContain("ajotaito");
    expect(meritHtml).not.toContain("hakumin");
  });
});
