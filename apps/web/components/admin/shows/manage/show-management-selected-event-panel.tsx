"use client";

import React from "react";
import { useShowManagementSelectedEventState } from "@web/hooks/admin/shows/manage/use-show-management-selected-event-state";
import { ShowManagementEditorPanel } from "./show-management-editor-panel";
import { ShowManagementRemovePanel } from "./show-management-remove-panel";
import type {
  ManageShowEditOptions,
  ManageShowEvent,
} from "./show-management-types";

export function ShowManagementSelectedEventPanel({
  selectedEvent,
  selectedEventUpdatedAt,
  resultOptions,
  statusText,
  onStatusTextChange,
  onSelectedEventIdChange,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  resultOptions: ManageShowEditOptions;
  statusText: string;
  onStatusTextChange: (nextStatusText: string) => void;
  onSelectedEventIdChange: (nextShowId: string) => void;
}) {
  const {
    pendingRemovalEntry,
    handleApplyEvent,
    handleApplyEntry,
    handleRequestRemoveEntry,
    handleCancelRemove,
    handleConfirmRemove,
    isApplyingEvent,
    isSyncingAfterSave,
    applyingEntryId,
    isRemovingEntry,
  } = useShowManagementSelectedEventState({
    selectedEvent,
    selectedEventUpdatedAt,
    statusText,
    onStatusTextChange,
    onSelectedEventIdChange,
  });

  return (
    <>
      <ShowManagementEditorPanel
        selectedEvent={selectedEvent}
        resultOptions={resultOptions}
        onApplyEvent={handleApplyEvent}
        onApplyEntry={handleApplyEntry}
        onRequestRemoveEntry={handleRequestRemoveEntry}
        statusText={statusText}
        isApplyingEvent={isApplyingEvent || isSyncingAfterSave}
        applyingEntryId={applyingEntryId}
        isRemovingEntry={isRemovingEntry}
      />

      <ShowManagementRemovePanel
        pendingRemovalEntry={pendingRemovalEntry}
        onCancel={handleCancelRemove}
        onConfirm={() => void handleConfirmRemove()}
        isConfirming={isRemovingEntry}
      />
    </>
  );
}
