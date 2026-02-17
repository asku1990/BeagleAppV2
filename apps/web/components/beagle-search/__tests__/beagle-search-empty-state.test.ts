import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BeagleSearchEmptyState } from "../beagle-search-empty-state";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

describe("BeagleSearchEmptyState", () => {
  it("renders start variant message key", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchEmptyState, { variant: "start" }),
    );

    expect(html).toContain("search.empty.start");
  });

  it("renders error variant message key", () => {
    const html = renderToStaticMarkup(
      React.createElement(BeagleSearchEmptyState, { variant: "error" }),
    );

    expect(html).toContain("search.empty.fetchFailed");
  });
});
