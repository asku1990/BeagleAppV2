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
  resultOptions,
}: {
  selectedEvent: ManageShowEvent;
  resultOptions: ManageShowEditOptions;
}) {
  const {
    draftEvent,
    pendingRemovalEntry,
    statusText,
    dirtyEntryIds,
    isEventDirty,
    handleEventFieldChange,
    handleEntryFieldChange,
    handleAddAward,
    handleRemoveAward,
    handleApplyEvent,
    handleApplyEntry,
    handleRequestRemoveEntry,
    handleCancelRemove,
    handleConfirmRemove,
    handleResetShell,
  } = useShowManagementSelectedEventState({
    selectedEvent,
    resultOptions,
  });

  return (
    <>
      <ShowManagementEditorPanel
        selectedEvent={draftEvent}
        resultOptions={resultOptions}
        isEventDirty={isEventDirty}
        dirtyEntryIds={dirtyEntryIds}
        onEventFieldChange={handleEventFieldChange}
        onEntryFieldChange={handleEntryFieldChange}
        onAddAward={handleAddAward}
        onRemoveAward={handleRemoveAward}
        onApplyEvent={handleApplyEvent}
        onApplyEntry={handleApplyEntry}
        onRequestRemoveEntry={handleRequestRemoveEntry}
        onResetShell={handleResetShell}
        statusText={statusText}
      />

      <ShowManagementRemovePanel
        pendingRemovalEntry={pendingRemovalEntry}
        onCancel={handleCancelRemove}
        onConfirm={handleConfirmRemove}
      />
    </>
  );
}
