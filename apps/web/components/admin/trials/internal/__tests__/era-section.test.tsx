import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { createEmptyEraDraft } from "@/lib/admin/trials/entry-edit-dialog-model";
import { resolveResultCreateFieldSet } from "@/lib/admin/trials/result-create-field-registry";
import { EraSection } from "../era-section";

describe("EraSection", () => {
  it("uses the current-era Ajotaito label only in configured creation", () => {
    const props = {
      eras: [createEmptyEraDraft(1)],
      isPending: false,
      onAddEra: vi.fn(),
      onRemoveEra: vi.fn(),
      onChangeEraField: vi.fn(),
    };

    const createHtml = renderToStaticMarkup(
      React.createElement(EraSection, {
        ...props,
        visibleFields:
          resolveResultCreateFieldSet("trw_post_20230801").eraFields,
      }),
    );
    const editHtml = renderToStaticMarkup(
      React.createElement(EraSection, props),
    );

    expect(createHtml).toContain("ajotaito");
    expect(createHtml).not.toContain("ajotaito / yleisvaikutelma");
    expect(editHtml).toContain("ajotaito / yleisvaikutelma");
  });
});
