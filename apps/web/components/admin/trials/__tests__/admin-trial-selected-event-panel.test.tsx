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

vi.mock("../admin-trial-entry-actions", () => ({
  AdminTrialEntryActions: ({ trialEntryId }: { trialEntryId: string }) =>
    React.createElement("div", null, `actions-${trialEntryId}`),
}));

vi.mock("../admin-trial-event-edit-dialog", () => ({
  AdminTrialEventEditDialog: ({ open }: { open: boolean }) =>
    React.createElement("div", null, `edit-dialog-${open}`),
}));

vi.mock("../admin-trial-event-delete-action", () => ({
  AdminTrialEventDeleteAction: ({ trialEventId }: { trialEventId: string }) =>
    React.createElement("div", null, `delete-event-${trialEventId}`),
}));

vi.mock("@/queries/admin/trials", () => ({
  useUpdateAdminTrialEventMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateAdminTrialEntryMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe("AdminTrialSelectedEventPanel", () => {
  it("renders selected event rows and row actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialSelectedEventPanel, {
        selectedEvent: {
          trialEventId: "event-1",
          trialRuleWindowId: "trw_post_20230801",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          jarjestaja: "Jarjestaja",
          ylituomari: "Judge",
          ylituomariNumero: null,
          ytKertomus: null,
          kennelpiiri: null,
          kennelpiirinro: null,
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
        onDeletedTrialEvent: vi.fn(),
      }),
    );

    expect(html).toContain("admin.trials.manage.selected.title");
    expect(html).toContain("Rex");
    expect(html).toContain("actions-trial-1");
    expect(html).toContain("admin.trials.manage.selected.actions.editEvent");
    expect(html).toContain("edit-dialog-false");
    expect(html).not.toContain(
      "admin.trials.manage.selected.actions.openWorkspace",
    );
  });

  it("renders an optional event workspace link", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialSelectedEventPanel, {
        selectedEvent: {
          trialEventId: "event-1",
          trialRuleWindowId: null,
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          jarjestaja: null,
          ylituomari: null,
          ylituomariNumero: null,
          ytKertomus: null,
          kennelpiiri: null,
          kennelpiirinro: null,
          sklKoeId: 12345,
          dogCount: 0,
          entries: [],
        },
        isLoading: false,
        isError: false,
        errorText: "error",
        workspaceHref: "/admin/trials/event-1",
        onDeletedTrialEvent: vi.fn(),
      }),
    );

    expect(html).toContain('href="/admin/trials/event-1"');
    expect(html).toContain(
      "admin.trials.manage.selected.actions.openWorkspace",
    );
  });

  it("shows event deletion only for an empty event when explicitly allowed", () => {
    const html = renderToStaticMarkup(
      React.createElement(AdminTrialSelectedEventPanel, {
        selectedEvent: {
          trialEventId: "event-1",
          trialRuleWindowId: null,
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          jarjestaja: null,
          ylituomari: null,
          ylituomariNumero: null,
          ytKertomus: null,
          kennelpiiri: null,
          kennelpiirinro: null,
          sklKoeId: 12345,
          dogCount: 0,
          entries: [],
        },
        isLoading: false,
        isError: false,
        errorText: "error",
        onDeletedTrialEvent: vi.fn(),
        allowEmptyEventDeletion: true,
      }),
    );

    expect(html).toContain("delete-event-event-1");
  });
});
