import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminShowsPageClient } from "../admin-shows-page-client";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: "fi",
  }),
}));

describe("AdminShowsPageClient", () => {
  it("renders the phase-1 admin shows sections", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminShowsPageClient),
    );

    expect(html).toContain("admin.shows.title");
    expect(html).toContain("admin.shows.description");
    expect(html).toContain("admin.shows.import.title");
    expect(html).toContain("admin.shows.import.upload.label");
    expect(html).toContain("admin.shows.import.selected.empty");
    expect(html).toContain("admin.shows.import.actions.validate");
    expect(html).toContain("admin.shows.import.actions.preview");
    expect(html).toContain("admin.shows.runs.title");
    expect(html).toContain("admin.shows.search.title");
  });
});
