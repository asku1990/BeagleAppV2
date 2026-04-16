import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialsPageClient } from "../admin-trials-page-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/components/listing", () => ({
  ListingResponsiveResults: ({
    desktop,
    mobile,
  }: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  }) => React.createElement(React.Fragment, null, desktop, mobile),
  ListingSectionShell: ({
    title,
    subtitle,
    count,
    children,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    count?: React.ReactNode;
    children: React.ReactNode;
  }) => React.createElement("section", null, title, subtitle, count, children),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) =>
    React.createElement("input", props),
}));

vi.mock("@/lib/admin/core/date", () => ({
  formatDateForFinland: (value: string | null | undefined) => value ?? "-",
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialsQuery: () => ({
    data: {
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialId: "trial-1",
          dogName: "Rex",
          registrationNo: "FI123",
          sklKoeId: 12345,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          judge: "Judge",
          piste: 98.5,
          pa: "1",
          sija: "2",
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe("AdminTrialsPageClient", () => {
  it("renders the admin trials list with the expected columns", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialsPageClient),
    );

    expect(html).toContain("admin.trials.title");
    expect(html).toContain("admin.trials.manage.title");
    expect(html).toContain("admin.trials.manage.columns.dog");
    expect(html).toContain("admin.trials.manage.columns.registration");
    expect(html).toContain("admin.trials.manage.columns.date");
    expect(html).toContain("admin.trials.manage.columns.place");
    expect(html).toContain("admin.trials.manage.columns.piste");
    expect(html).toContain("admin.trials.manage.columns.pa");
    expect(html).toContain("admin.trials.manage.columns.sija");
    expect(html).toContain("admin.trials.manage.columns.judge");
    expect(html).toContain("admin.trials.manage.results.openDetailHint");
    expect(html).toContain("admin.trials.manage.results.openDetailAriaPrefix");
    expect(html).toContain("admin.trials.validation.title");
    expect(html).toContain("admin.trials.validation.sections.missing");
    expect(html).toContain("admin.trials.validation.incomplete.notEvaluated");
    expect(html).toContain("Rex");
    expect(html).toContain("FI123");
    expect(html).toContain("12345");
  });
});
