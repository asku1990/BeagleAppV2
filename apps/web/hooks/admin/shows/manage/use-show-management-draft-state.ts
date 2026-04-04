"use client";

import { useState } from "react";
import {
  addEntryAward,
  areShowEventFieldsEqual,
  cloneManageShowEvent,
  createEventLocalState,
  createManageShowAward,
  getDirtyEntryIds,
  removeEntryAward,
  updateDraftEntryField,
  updateDraftEventField,
} from "@/lib/admin/shows/manage";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

export function useShowManagementDraftState(selectedEvent: ManageShowEvent) {
  const [eventState, setEventState] = useState(() =>
    createEventLocalState(selectedEvent),
  );

  const { draftEvent, appliedEvent, pendingRemovalEntry, statusText } =
    eventState;
  const dirtyEntryIds = getDirtyEntryIds(draftEvent, appliedEvent);
  const isEventDirty = !areShowEventFieldsEqual(draftEvent, appliedEvent);
  const hasUnsavedChanges = isEventDirty || dirtyEntryIds.length > 0;

  function updateSelectedEventState(
    update: (current: typeof eventState) => typeof eventState,
  ) {
    setEventState((current) => update(current));
  }

  function setStatusText(nextStatusText: string) {
    updateSelectedEventState((current) => ({
      ...current,
      statusText: nextStatusText,
    }));
  }

  function setEventField(
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) {
    updateSelectedEventState((current) =>
      updateDraftEventField(current, field, value),
    );
  }

  function setEntryField(
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) {
    updateSelectedEventState((current) =>
      updateDraftEntryField(current, entryId, field, value),
    );
  }

  function addAward(entryId: string, awardCode: string) {
    updateSelectedEventState((current) => {
      const nextAward = createManageShowAward(
        `${entryId}:${awardCode.trim()}`,
        awardCode,
      );
      const nextEntries = addEntryAward(
        current.draftEvent.entries,
        entryId,
        nextAward,
      );

      return {
        ...current,
        draftEvent: {
          ...cloneManageShowEvent(current.draftEvent),
          entries: nextEntries,
        },
      };
    });
  }

  function removeAward(entryId: string, awardId: string) {
    updateSelectedEventState((current) => {
      const nextEntries = removeEntryAward(
        current.draftEvent.entries,
        entryId,
        awardId,
      );

      return {
        ...current,
        draftEvent: {
          ...cloneManageShowEvent(current.draftEvent),
          entries: nextEntries,
        },
      };
    });
  }

  function requestRemoveEntry(entry: ManageShowEntry) {
    updateSelectedEventState((current) => ({
      ...current,
      pendingRemovalEntry: {
        eventId: selectedEvent.id,
        entryId: entry.id,
        dogName: entry.dogName,
      },
    }));
  }

  function cancelRemove() {
    updateSelectedEventState((current) => ({
      ...current,
      pendingRemovalEntry: null,
    }));
  }

  function resetDraftToApplied() {
    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: cloneManageShowEvent(current.appliedEvent),
    }));
  }

  function applyServerSnapshot(input: {
    selectedEventFromServer: ManageShowEvent;
    statusTextFromOperation: string;
    clearPendingRemoval: boolean;
  }) {
    setEventState((current) => ({
      ...createEventLocalState(input.selectedEventFromServer),
      pendingRemovalEntry: input.clearPendingRemoval
        ? null
        : current.pendingRemovalEntry,
      statusText: input.statusTextFromOperation,
    }));
  }

  return {
    draftEvent,
    appliedEvent,
    pendingRemovalEntry,
    statusText,
    dirtyEntryIds,
    isEventDirty,
    hasUnsavedChanges,
    setEventField,
    setEntryField,
    addAward,
    removeAward,
    requestRemoveEntry,
    cancelRemove,
    resetDraftToApplied,
    setStatusText,
    applyServerSnapshot,
  };
}
