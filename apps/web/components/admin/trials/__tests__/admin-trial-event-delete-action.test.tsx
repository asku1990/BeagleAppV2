import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { AdminTrialEventDeleteAction } from "../admin-trial-event-delete-action";

const {
  confirmModalPropsRef,
  mutationState,
  mutateAsyncMock,
  toastErrorMock,
  toastSuccessMock,
} = vi.hoisted(() => ({
  confirmModalPropsRef: { current: null as Record<string, unknown> | null },
  mutationState: { isPending: false },
  mutateAsyncMock: vi.fn(),
  toastErrorMock: vi.fn(),
  toastSuccessMock: vi.fn(),
}));

vi.mock("@/hooks/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/queries/admin/trials", () => ({
  useDeleteAdminTrialEventMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: mutationState.isPending,
  }),
}));

vi.mock("@/components/ui/sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("@/components/ui/confirm-modal", () => ({
  ConfirmModal: (props: Record<string, unknown>) => {
    confirmModalPropsRef.current = props;
    return React.createElement("div", null, String(props.description));
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    React.createElement("button", props, children),
}));

function renderAction(overrides?: {
  onDeleted?: (trialEventId: string) => void;
  onNotEmpty?: () => void;
}) {
  const onDeleted = overrides?.onDeleted ?? vi.fn();
  const onNotEmpty = overrides?.onNotEmpty ?? vi.fn();
  const html = renderToStaticMarkup(
    <AdminTrialEventDeleteAction
      trialEventId="event-1"
      onDeleted={onDeleted}
      onNotEmpty={onNotEmpty}
    />,
  );

  return { html, onDeleted, onNotEmpty };
}

function confirmDeletion() {
  const onConfirm = confirmModalPropsRef.current?.onConfirm as () => void;
  onConfirm();
}

describe("AdminTrialEventDeleteAction", () => {
  beforeEach(() => {
    confirmModalPropsRef.current = null;
    mutationState.isPending = false;
    mutateAsyncMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  it("wires the destructive confirmation and pending state", () => {
    mutationState.isPending = true;

    const { html } = renderAction();

    expect(html).toContain("admin.trials.manage.deleteEvent.action");
    expect(html).not.toContain("admin.trials.manage.deleteEvent.error");
    expect(confirmModalPropsRef.current).toMatchObject({
      open: false,
      isConfirming: true,
      title: "admin.trials.manage.deleteEvent.confirmTitle",
      description: "admin.trials.manage.deleteEvent.confirmBody",
    });
  });

  it("shows success feedback and reports the deleted event", async () => {
    mutateAsyncMock.mockResolvedValue({ deletedTrialEventId: "event-1" });
    const { onDeleted, onNotEmpty } = renderAction();

    confirmDeletion();

    await vi.waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith(
        "admin.trials.manage.deleteEvent.success",
      );
    });
    expect(onDeleted).toHaveBeenCalledWith("event-1");
    expect(onNotEmpty).not.toHaveBeenCalled();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("shows one generic error toast without reporting deletion", async () => {
    mutateAsyncMock.mockRejectedValue(new Error("boom"));
    const { onDeleted, onNotEmpty } = renderAction();

    confirmDeletion();

    await vi.waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "admin.trials.manage.deleteEvent.error",
      );
    });
    expect(toastErrorMock).toHaveBeenCalledOnce();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(onNotEmpty).not.toHaveBeenCalled();
  });

  it("refreshes and shows localized feedback for a non-empty conflict", async () => {
    mutateAsyncMock.mockRejectedValue(
      new AdminMutationError("Conflict", "TRIAL_EVENT_NOT_EMPTY"),
    );
    const { onDeleted, onNotEmpty } = renderAction();

    confirmDeletion();

    await vi.waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith(
        "admin.trials.manage.deleteEvent.notEmpty",
      );
    });
    expect(onNotEmpty).toHaveBeenCalledOnce();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
