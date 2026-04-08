"use client";

import { useState } from "react";
import type {
  ManageShowEntry,
  ManageShowEvent,
  PendingRemovalEntry,
} from "@/components/admin/shows/manage/show-management-types";
import { useShowManagementMutationFlow } from "./use-show-management-mutation-flow";

export function useShowManagementSelectedEventState({
  selectedEvent,
  selectedEventUpdatedAt,
  statusText,
  onStatusTextChange,
  onSelectedEventIdChange,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  statusText: string;
  onStatusTextChange: (nextStatusText: string) => void;
  onSelectedEventIdChange: (nextShowId: string) => void;
}) {
  const [pendingRemovalEntry, setPendingRemovalEntry] =
    useState<PendingRemovalEntry>(null);

  const mutationFlow = useShowManagementMutationFlow({
    selectedEvent,
    selectedEventUpdatedAt,
    onSelectedEventIdChange,
    onStatusTextChange,
    onRemoveConfirmed: () => setPendingRemovalEntry(null),
  });

  function handleRequestRemoveEntry(entry: ManageShowEntry) {
    setPendingRemovalEntry({
      eventId: selectedEvent.id,
      entryId: entry.id,
      dogName: entry.dogName,
    });
  }

  function handleCancelRemove() {
    setPendingRemovalEntry(null);
  }

  return {
    pendingRemovalEntry,
    statusText,
    isApplyingEvent: mutationFlow.isApplyingEvent,
    isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
    applyingEntryId: mutationFlow.applyingEntryId,
    isRemovingEntry: mutationFlow.isRemovingEntry,
    handleApplyEvent: mutationFlow.applyEventChanges,
    handleApplyEntry: mutationFlow.applyEntryChanges,
    handleRequestRemoveEntry,
    handleCancelRemove,
    handleConfirmRemove: () =>
      mutationFlow.confirmRemoveEntry(pendingRemovalEntry),
  };
}
