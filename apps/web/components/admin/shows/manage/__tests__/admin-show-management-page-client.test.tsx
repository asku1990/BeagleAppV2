import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminShowManagementPageClient } from "../admin-show-management-page-client";

vi.mock("@/components/listing", () => ({
  ListingSectionShell: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
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
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props as Record<string, string>),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => React.createElement("hr", null),
}));

describe("AdminShowManagementPageClient", () => {
  it("renders the event-first show management shell", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminShowManagementPageClient),
    );

    expect(html).toContain("Show management");
    expect(html).toContain(
      "Search shows, open one event, and edit its entries locally while the backend is still being built.",
    );
    expect(html).toContain(
      "Search by place, dog, registration number, or judge",
    );
    expect(html).toContain("Metsapolun Kide");
    expect(html).toContain("Dog evaluations");
    expect(html).not.toContain("Apply event changes");
    expect(html).not.toContain("Apply entry changes");
  });
});
