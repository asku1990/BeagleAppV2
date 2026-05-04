import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AdminTrialEntryActions } from "../admin-trial-entry-actions";

const { useDeleteAdminTrialEntryMutationMock } = vi.hoisted(() => ({
  useDeleteAdminTrialEntryMutationMock: vi.fn(),
}));

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

vi.mock("@/components/admin", () => ({
  AdminRowActionsMenu: ({ triggerAriaLabel }: { triggerAriaLabel: string }) =>
    React.createElement("div", null, `menu-${triggerAriaLabel}`),
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

vi.mock("@/queries/admin/trials", () => ({
  useDeleteAdminTrialEntryMutation: useDeleteAdminTrialEntryMutationMock,
}));

describe("AdminTrialEntryActions", () => {
  it("renders icon pdf action and overflow menu", () => {
    useDeleteAdminTrialEntryMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEntryActions, {
        trialEventId: "event-1",
        trialEntryId: "entry-1",
        trialId: "trial-1",
        dogName: "Rex",
        registrationNo: "FI123",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        eventName: "Kevatkoe",
        onDeletedTrialEvent: vi.fn(),
      }),
    );

    expect(html).toContain("admin.trials.manage.selected.actions.openPdf");
    expect(html).toContain("menu-admin.trials.manage.selected.actions.more");
    expect(html).toContain('href="/api/trials/trial-1/pdf"');
  });
});
