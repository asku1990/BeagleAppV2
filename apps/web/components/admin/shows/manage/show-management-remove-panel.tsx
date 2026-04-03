"use client";

import React from "react";
import { ConfirmModal } from "@web/components/ui/confirm-modal";
import type { PendingRemovalEntry } from "./show-management-types";

type ShowManagementRemovePanelProps = {
  pendingRemovalEntry: PendingRemovalEntry;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ShowManagementRemovePanel({
  pendingRemovalEntry,
  onCancel,
  onConfirm,
}: ShowManagementRemovePanelProps) {
  return (
    <ConfirmModal
      open={Boolean(pendingRemovalEntry)}
      title="Remove dog from event"
      description={
        <>
          {pendingRemovalEntry?.dogName ?? "This dog"} will be removed only from
          this event.
        </>
      }
      confirmLabel="Remove"
      cancelLabel="Cancel"
      confirmVariant="destructive"
      ariaLabel="Remove dog from event"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
