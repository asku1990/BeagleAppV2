import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTrialEntryActions } from "../admin-trial-entry-actions";

const { useDeleteAdminTrialEntryMutationMock, rowActionsMock } = vi.hoisted(
  () => ({
    useDeleteAdminTrialEntryMutationMock: vi.fn(),
    rowActionsMock: { current: [] as Array<{ onSelect: () => void }> },
  }),
);

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
  AdminRowActionsMenu: ({
    triggerAriaLabel,
    actions,
  }: {
    triggerAriaLabel: string;
    actions: Array<{ onSelect: () => void }>;
  }) => {
    rowActionsMock.current = actions;
    return React.createElement("div", null, `menu-${triggerAriaLabel}`);
  },
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
  beforeEach(() => {
    useDeleteAdminTrialEntryMutationMock.mockReset();
    rowActionsMock.current = [];
  });

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

  it("calls delete mutation with correct ids", async () => {
    vi.stubGlobal("window", { confirm: () => true, alert: vi.fn() });
    const mutateAsync = vi.fn().mockResolvedValue({
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: false,
    });
    useDeleteAdminTrialEntryMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderToStaticMarkup(
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

    await rowActionsMock.current[0]?.onSelect();

    expect(mutateAsync).toHaveBeenCalledWith({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });
    vi.unstubAllGlobals();
  });

  it("calls onDeletedTrialEvent when deletion removes whole event", async () => {
    vi.stubGlobal("window", { confirm: () => true, alert: vi.fn() });
    const onDeletedTrialEvent = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: true,
    });
    useDeleteAdminTrialEntryMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderToStaticMarkup(
      React.createElement(AdminTrialEntryActions, {
        trialEventId: "event-1",
        trialEntryId: "entry-1",
        trialId: "trial-1",
        dogName: "Rex",
        registrationNo: "FI123",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        eventName: "Kevatkoe",
        onDeletedTrialEvent,
      }),
    );

    await rowActionsMock.current[0]?.onSelect();

    expect(onDeletedTrialEvent).toHaveBeenCalledWith("event-1");
    vi.unstubAllGlobals();
  });
});
