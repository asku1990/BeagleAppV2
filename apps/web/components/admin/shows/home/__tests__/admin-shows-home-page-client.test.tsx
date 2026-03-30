import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminShowsHomePageClient } from "../admin-shows-home-page-client";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href }, children),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) =>
    asChild
      ? React.createElement(React.Fragment, null, children)
      : React.createElement(
          "button",
          props as Record<string, string>,
          children,
        ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
  CardTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement("h2", null, children),
}));

describe("AdminShowsHomePageClient", () => {
  it("renders the shows module landing actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminShowsHomePageClient),
    );

    expect(html).toContain("admin.shows.title");
    expect(html).toContain("admin.shows.home.import.open");
    expect(html).toContain("/admin/shows/import");
    expect(html).toContain("admin.shows.home.runs.comingSoon");
    expect(html).toContain("admin.shows.home.search.comingSoon");
  });
});
