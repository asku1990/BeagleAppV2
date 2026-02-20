import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListLoadingSkeleton } from "../list-loading-skeleton";

describe("ListLoadingSkeleton", () => {
  it("renders configured loading blocks", () => {
    const html = renderToStaticMarkup(
      React.createElement(ListLoadingSkeleton, {
        desktopRows: 2,
        mobileCards: 1,
      }),
    );

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("md:block");
    expect(html).toContain("md:hidden");
    expect(
      html.match(/data-slot="skeleton"/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(5);
  });

  it("renders simple row list variant", () => {
    const html = renderToStaticMarkup(
      React.createElement(ListLoadingSkeleton, {
        rows: 4,
        desktopRows: 0,
        mobileCards: 0,
      }),
    );

    expect(html).toContain('aria-busy="true"');
    expect(html.match(/data-slot="skeleton"/g)?.length ?? 0).toBe(4);
  });
});
