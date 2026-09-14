import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { formatWorkbookImportElapsedTime } from "@/lib/admin/shows/import/workbook-import-progress";
import { AdminShowWorkbookImportPageClient } from "../admin-show-workbook-import-page-client";
import { WorkbookImportProgressStatus } from "../workbook-import-progress-status";

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

  it("formats wall-clock elapsed time as m:ss", () => {
    expect(formatWorkbookImportElapsedTime(0)).toBe("0:00");
    expect(formatWorkbookImportElapsedTime(65)).toBe("1:05");
    expect(formatWorkbookImportElapsedTime(3_661)).toBe("61:01");
  });

  it("shows atomic wait guidance, known counts, and elapsed time", () => {
    const html = renderToStaticMarkup(
      React.createElement(WorkbookImportProgressStatus, {
        title: "Workbookia tuodaan",
        guidance:
          "Odota. Tuonti tallennetaan yhtenä kokonaisuutena vasta lopuksi.",
        elapsedLabel: "Kulunut",
        elapsedSeconds: 65,
        locale: "en-US",
        counts: {
          events: 463,
          entries: 5_018,
          resultItems: 22_827,
        },
        countLabels: {
          events: "tapahtumia",
          entries: "merkintöjä",
          resultItems: "tuloksia",
        },
      }),
    );

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("Kulunut 1:05");
    expect(html).toContain("463 tapahtumia");
    expect(html).toContain("5,018 merkintöjä");
    expect(html).toContain("22,827 tuloksia");
    expect(html).toContain("yhtenä kokonaisuutena");
  });
});
