import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEntryActions } from "../admin-trial-entry-actions";

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) =>
    asChild
      ? React.createElement(React.Fragment, null, children)
      : React.createElement("button", props, children),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children),
}));

describe("AdminTrialEntryActions", () => {
  it("renders the pdf action", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEntryActions, {
        trialId: "trial-1",
      }),
    );

    expect(html).toContain("admin.trials.manage.selected.actions.openPdf");
    expect(html).toContain('href="/api/trials/trial-1/pdf"');
  });
});
