import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ResultCreateCard } from "../result-create-card";

describe("ResultCreateCard", () => {
  it("uses an accessible button header and hides collapsed content", () => {
    const html = renderToStaticMarkup(
      <ResultCreateCard
        id="basic"
        title="Perustiedot"
        summary="FI123"
        open={false}
        onToggle={vi.fn()}
      >
        <p>fields</p>
      </ResultCreateCard>,
    );

    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="basic-content"');
    expect(html).toContain("FI123");
    expect(html).not.toContain("fields");
  });

  it("renders independently controlled expanded content", () => {
    const html = renderToStaticMarkup(
      <ResultCreateCard id="eras" title="Erät" open onToggle={vi.fn()}>
        <p>fields</p>
      </ResultCreateCard>,
    );

    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('id="eras-content"');
    expect(html).toContain("fields");
  });
});
