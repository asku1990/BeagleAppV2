import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialsPageClient } from "../admin-trials-page-client";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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
      : React.createElement(
          "button",
          props as Record<string, string>,
          children,
        ),
}));

vi.mock("@/lib/admin/core/date", () => ({
  formatDateForFinland: (value: string | null | undefined) => value ?? "-",
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialEventsQuery: () => ({
    data: {
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          organizer: "Jarjestaja",
          judge: "Judge",
          sklKoeId: 12345,
          dogCount: 2,
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useAdminTrialEventQuery: () => ({
    data: {
      event: {
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        eventName: "Kevatkoe",
        organizer: "Jarjestaja",
        judge: "Judge",
        sklKoeId: 12345,
        koemuoto: "AJOK",
        dogCount: 2,
        entries: [
          {
            trialId: "trial-1",
            dogId: null,
            dogName: "Rex",
            registrationNo: "FI123",
            entryKey: "entry-1",
            rank: "2",
            award: "VOI1",
            points: 98.5,
            judge: "Judge",
          },
        ],
      },
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

describe("AdminTrialsPageClient", () => {
  it("renders event-first admin trials flow with event and row actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialsPageClient),
    );

    expect(html).toContain("admin.trials.title");
    expect(html).toContain("admin.trials.manage.events.title");
    expect(html).toContain("admin.trials.manage.events.columns.date");
    expect(html).toContain("admin.trials.manage.events.columns.place");
    expect(html).toContain("admin.trials.manage.selected.title");
    expect(html).toContain("admin.trials.manage.selected.columns.dog");
    expect(html).toContain("admin.trials.manage.selected.columns.registration");
    expect(html).toContain("admin.trials.manage.selected.columns.actions");
    expect(html).toContain("admin.trials.manage.selected.actions.openDetail");
    expect(html).toContain("admin.trials.manage.selected.actions.openPdf");
    expect(html).toContain("admin.trials.manage.filters.mode.year");
    expect(html).toContain("admin.trials.manage.filters.mode.range");
    expect(html).toContain("admin.trials.manage.filters.sort.dateDesc");
    expect(html).toContain("Rex");
    expect(html).toContain("FI123");
    expect(html).toContain('href="/api/trials/trial-1/pdf"');
  });
});
