import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatsGridLoadingSkeleton } from "../stats-grid-loading-skeleton";

describe("StatsGridLoadingSkeleton", () => {
  it("renders cards and row skeletons based on props", () => {
    const html = renderToStaticMarkup(
      React.createElement(StatsGridLoadingSkeleton, {
        cardCount: 2,
        rowsPerCard: [1, 2],
      }),
    );

    expect(html).toContain("grid");
    expect(html.match(/<section/g)?.length ?? 0).toBe(2);
    expect(html.match(/data-slot=\"skeleton\"/g)?.length ?? 0).toBe(8);
  });
});
