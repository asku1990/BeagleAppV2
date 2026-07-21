import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTrialEventWorkspacePageClient } from "../admin-trial-event-workspace-page-client";

const {
  buttonActionsRef,
  panelPropsRef,
  queryState,
  refetchMock,
  replaceMock,
} = vi.hoisted(() => ({
  buttonActionsRef: {
    current: {} as Record<string, (() => void) | undefined>,
  },
  panelPropsRef: { current: null as Record<string, unknown> | null },
  queryState: {
    data: undefined as { event: { trialEventId: string } } | undefined,
    error: null as { errorCode?: string } | null,
    isError: false,
    isLoading: false,
  },
  refetchMock: vi.fn(),
  replaceMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
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
  }) => {
    if (typeof children === "string") {
      buttonActionsRef.current[children] = props.onClick as
        | (() => void)
        | undefined;
    }
    return asChild
      ? React.createElement(React.Fragment, null, children)
      : React.createElement("button", props, children);
  },
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) =>
    React.createElement("section", null, children),
  CardContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", null, children),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/queries/admin/trials", () => ({
  useAdminTrialEventQuery: () => ({ ...queryState, refetch: refetchMock }),
}));

vi.mock("../admin-trial-selected-event-panel", () => ({
  AdminTrialSelectedEventPanel: (props: Record<string, unknown>) => {
    panelPropsRef.current = props;
    return React.createElement("section", null, "selected-event-panel");
  },
}));

describe("AdminTrialEventWorkspacePageClient", () => {
  beforeEach(() => {
    queryState.data = undefined;
    queryState.error = null;
    queryState.isError = false;
    queryState.isLoading = false;
    panelPropsRef.current = null;
    buttonActionsRef.current = {};
    refetchMock.mockReset();
    replaceMock.mockReset();
  });

  it("loads the requested event and renders the reused panel without a self-link", () => {
    queryState.data = { event: { trialEventId: "event-1" } };

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventWorkspacePageClient, {
        trialEventId: "event-1",
      }),
    );

    expect(html).toContain("admin.trials.manage.workspace.title");
    expect(html).toContain("selected-event-panel");
    expect(panelPropsRef.current?.selectedEvent).toEqual({
      trialEventId: "event-1",
    });
    expect(panelPropsRef.current?.workspaceHref).toBeUndefined();
  });

  it("passes loading state to the reused panel", () => {
    queryState.isLoading = true;

    renderToStaticMarkup(
      React.createElement(AdminTrialEventWorkspacePageClient, {
        trialEventId: "event-1",
      }),
    );

    expect(panelPropsRef.current?.isLoading).toBe(true);
  });

  it("renders a dedicated not-found state without another event", () => {
    queryState.isError = true;
    queryState.error = { errorCode: "TRIAL_EVENT_NOT_FOUND" };

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventWorkspacePageClient, {
        trialEventId: "missing-event",
      }),
    );

    expect(html).toContain("admin.trials.manage.workspace.notFound");
    expect(html).not.toContain("selected-event-panel");
    expect(html).not.toContain("admin.trials.manage.workspace.retry");
  });

  it("renders a retry action for generic read errors", () => {
    queryState.isError = true;
    queryState.error = { errorCode: "INTERNAL_ERROR" };

    const html = renderToStaticMarkup(
      React.createElement(AdminTrialEventWorkspacePageClient, {
        trialEventId: "event-1",
      }),
    );

    expect(html).toContain("admin.trials.manage.workspace.error");
    expect(html).toContain("admin.trials.manage.workspace.retry");
    buttonActionsRef.current["admin.trials.manage.workspace.retry"]?.();
    expect(refetchMock).toHaveBeenCalledOnce();
  });

  it("returns to the trials page when the current event is deleted", () => {
    queryState.data = { event: { trialEventId: "event-1" } };

    renderToStaticMarkup(
      React.createElement(AdminTrialEventWorkspacePageClient, {
        trialEventId: "event-1",
      }),
    );
    const onDeletedTrialEvent = panelPropsRef.current
      ?.onDeletedTrialEvent as () => void;
    onDeletedTrialEvent();

    expect(replaceMock).toHaveBeenCalledWith("/admin/trials");
  });
});
