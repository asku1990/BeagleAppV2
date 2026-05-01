import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEventsResults } from "../admin-trial-events-results";

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

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("button", props, children),
}));

describe("AdminTrialEventsResults", () => {
  it("renders event rows and pagination", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventsResults, {
        events: [
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
        selectedEventId: "event-1",
        totalCount: 1,
        page: 1,
        totalPages: 2,
        isLoading: false,
        isError: false,
        errorText: "error",
        onSelectEvent: vi.fn(),
        onPageDelta: vi.fn(),
      }),
    );

    expect(html).toContain("admin.trials.manage.events.title");
    expect(html).toContain("Helsinki");
    expect(html).toContain("Kevatkoe");
    expect(html).toContain("admin.trials.manage.pagination.next");
  });
});
