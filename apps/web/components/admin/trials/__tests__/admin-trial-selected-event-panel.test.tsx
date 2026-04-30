import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialSelectedEventPanel } from "../admin-trial-selected-event-panel";

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
    children,
  }: {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children: React.ReactNode;
  }) => React.createElement("section", null, title, subtitle, children),
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

describe("AdminTrialSelectedEventPanel", () => {
  it("renders selected event rows and row actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialSelectedEventPanel, {
        selectedEvent: {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          organizer: "Jarjestaja",
          judge: "Judge",
          sklKoeId: 12345,
          dogCount: 1,
          entries: [
            {
              trialId: "trial-1",
              dogId: null,
              dogName: "Rex",
              registrationNo: "FI123",
              entryKey: "entry-1",
              koemuoto: "AJOK",
              koetyyppi: "NORMAL",
              rank: "2",
              award: "VOI1",
              points: 98.5,
              judge: "Judge",
            },
          ],
        },
        isLoading: false,
        isError: false,
        errorText: "error",
      }),
    );

    expect(html).toContain("admin.trials.manage.selected.title");
    expect(html).toContain("Rex");
    expect(html).toContain("admin.trials.manage.selected.actions.openPdf");
  });
});
