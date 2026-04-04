"use client";

import {
  isEntryInteractionBlocked,
  isEventInteractionBlocked,
} from "@/lib/admin/shows/manage";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";
import { useShowManagementDraftState } from "./use-show-management-draft-state";
import { useShowManagementMutationFlow } from "./use-show-management-mutation-flow";
import { useUnsavedChangesUnloadGuard } from "./use-unsaved-changes-unload-guard";

export function useShowManagementSelectedEventState({
  selectedEvent,
  selectedEventUpdatedAt,
  onSelectedEventIdChange,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  onSelectedEventIdChange: (nextShowId: string) => void;
}) {
  const draftState = useShowManagementDraftState(selectedEvent);
  const mutationFlow = useShowManagementMutationFlow({
    selectedEvent,
    selectedEventUpdatedAt,
    onSelectedEventIdChange,
    draftEvent: draftState.draftEvent,
    appliedEvent: draftState.appliedEvent,
    pendingRemovalEntry: draftState.pendingRemovalEntry,
    applyServerSnapshot: draftState.applyServerSnapshot,
    setStatusText: draftState.setStatusText,
  });

  useUnsavedChangesUnloadGuard(draftState.hasUnsavedChanges);

  function handleEventFieldChange(
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) {
    if (
      isEventInteractionBlocked({
        isApplyingEvent: mutationFlow.isApplyingEvent,
        isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
        applyingEntryId: mutationFlow.applyingEntryId,
        isRemovingEntry: mutationFlow.isRemovingEntry,
      })
    ) {
      return;
    }

    draftState.setEventField(field, value);
  }

  function handleEntryFieldChange(
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) {
    if (
      isEntryInteractionBlocked(
        {
          isApplyingEvent: mutationFlow.isApplyingEvent,
          isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
          applyingEntryId: mutationFlow.applyingEntryId,
          isRemovingEntry: mutationFlow.isRemovingEntry,
        },
        entryId,
      )
    ) {
      return;
    }

    draftState.setEntryField(entryId, field, value);
  }

  function handleAddAward(entryId: string, awardCode: string) {
    if (
      isEntryInteractionBlocked(
        {
          isApplyingEvent: mutationFlow.isApplyingEvent,
          isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
          applyingEntryId: mutationFlow.applyingEntryId,
          isRemovingEntry: mutationFlow.isRemovingEntry,
        },
        entryId,
      )
    ) {
      return;
    }

    draftState.addAward(entryId, awardCode);
  }

  function handleRemoveAward(entryId: string, awardId: string) {
    if (
      isEntryInteractionBlocked(
        {
          isApplyingEvent: mutationFlow.isApplyingEvent,
          isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
          applyingEntryId: mutationFlow.applyingEntryId,
          isRemovingEntry: mutationFlow.isRemovingEntry,
        },
        entryId,
      )
    ) {
      return;
    }

    draftState.removeAward(entryId, awardId);
  }

  function handleResetShell() {
    if (
      draftState.hasUnsavedChanges &&
      !window.confirm("Discard unsaved changes?")
    ) {
      return;
    }

    draftState.resetDraftToApplied();
    draftState.setStatusText("Local draft reset to the loaded event details.");
  }

  return {
    draftEvent: draftState.draftEvent,
    pendingRemovalEntry: draftState.pendingRemovalEntry,
    statusText: draftState.statusText,
    dirtyEntryIds: draftState.dirtyEntryIds,
    isEventDirty: draftState.isEventDirty,
    isApplyingEvent: mutationFlow.isApplyingEvent,
    isSyncingAfterSave: mutationFlow.isSyncingAfterSave,
    applyingEntryId: mutationFlow.applyingEntryId,
    isRemovingEntry: mutationFlow.isRemovingEntry,
    handleEventFieldChange,
    handleEntryFieldChange,
    handleAddAward,
    handleRemoveAward,
    handleApplyEvent: mutationFlow.applyEventChanges,
    handleApplyEntry: mutationFlow.applyEntryChanges,
    handleRequestRemoveEntry: draftState.requestRemoveEntry,
    handleCancelRemove: draftState.cancelRemove,
    handleConfirmRemove: mutationFlow.confirmRemoveEntry,
    handleResetShell,
  };
}
