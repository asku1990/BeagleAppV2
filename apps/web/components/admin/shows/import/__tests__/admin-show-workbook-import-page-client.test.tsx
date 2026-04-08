import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminShowWorkbookImportPageClient } from "../admin-show-workbook-import-page-client";

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

vi.mock("@/components/ui/input", () => ({
  Input: (props: Record<string, unknown>) =>
    React.createElement("input", props as Record<string, string>),
}));

vi.mock("@/components/ui/sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("@/app/actions/admin/shows/import", () => ({
  previewAdminShowWorkbookImportAction: vi.fn(),
  applyAdminShowWorkbookImportAction: vi.fn(),
}));

vi.mock("@/lib/admin/shows/import/workbook-file", () => ({
  SHOW_WORKBOOK_ACCEPT: ".xlsx",
  isShowWorkbookFile: () => true,
  formatShowWorkbookFileSize: () => "1 KiB",
}));

vi.mock("../show-workbook-preview-section", () => ({
  ShowWorkbookPreviewSection: () => null,
}));

vi.mock("../show-workbook-validation-panel", () => ({
  ShowWorkbookValidationPanel: () =>
    React.createElement("div", null, "admin.shows.validation.title"),
}));

describe("AdminShowWorkbookImportPageClient", () => {
  it("renders the dedicated workbook import workspace", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminShowWorkbookImportPageClient),
    );

    expect(html).not.toContain("admin.shows.import.back");
    expect(html).toContain("admin.shows.import.title");
    expect(html).toContain("admin.shows.import.upload.title");
    expect(html).toContain("admin.shows.import.actions.validate");
    expect(html).toContain("admin.shows.import.actions.import");
    expect(html).toContain("admin.shows.validation.title");
  });
});
