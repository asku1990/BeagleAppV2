"use client";

import { useEffect, useState } from "react";
import {
  addEntryAward,
  areShowEntriesEqual,
  areShowEventFieldsEqual,
  cloneManageShowEvent,
  createEventLocalState,
  createManageShowAward,
  getAppliedEntry,
  getAwardLogEntries,
  getDirtyEntryIds,
  removeEntryAward,
  updateDraftEntryField,
  updateDraftEventField,
  updateEntry,
} from "@web/lib/admin/shows/manage";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

export function useShowManagementSelectedEventState({
  selectedEvent,
  resultOptions,
}: {
  selectedEvent: ManageShowEvent;
  resultOptions: ManageShowEditOptions;
}) {
  const [eventStateById, setEventStateById] = useState(() => ({
    [selectedEvent.id]: createEventLocalState(selectedEvent),
  }));

  const selectedEventState =
    eventStateById[selectedEvent.id] ?? createEventLocalState(selectedEvent);
  const { draftEvent, appliedEvent, pendingRemovalEntry, statusText } =
    selectedEventState;

  console.info("[show-manage][parent][render]", {
    eventId: selectedEvent.id,
    entries: draftEvent.entries.map((entry) => ({
      entryId: entry.id,
      dogName: entry.dogName,
      awards: getAwardLogEntries(entry.awards),
    })),
  });

  function updateSelectedEventState(
    update: (current: typeof selectedEventState) => typeof selectedEventState,
  ) {
    setEventStateById((current) => {
      const currentSelectedState =
        current[selectedEvent.id] ?? createEventLocalState(selectedEvent);
      return {
        ...current,
        [selectedEvent.id]: update(currentSelectedState),
      };
    });
  }

  const dirtyEntryIds = getDirtyEntryIds(draftEvent, appliedEvent);
  const isEventDirty = !areShowEventFieldsEqual(draftEvent, appliedEvent);
  const hasUnsavedChanges = isEventDirty || dirtyEntryIds.length > 0;

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  function handleEventFieldChange(
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) {
    updateSelectedEventState((current) =>
      updateDraftEventField(current, field, value),
    );
  }

  function handleEntryFieldChange(
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) {
    updateSelectedEventState((current) =>
      updateDraftEntryField(current, entryId, field, value),
    );
  }

  function handleAddAward(entryId: string, awardCode: string) {
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

      console.info("[show-manage][parent][handleAddAward]", {
        entryId,
        awardId: nextAward.id,
        awardCode: nextAward.code,
        before: getAwardLogEntries(
          current.draftEvent.entries.find((entry) => entry.id === entryId)
            ?.awards ?? [],
        ),
        after: getAwardLogEntries(
          nextEntries.find((entry) => entry.id === entryId)?.awards ?? [],
        ),
      });

      return {
        ...current,
        draftEvent: {
          ...cloneManageShowEvent(current.draftEvent),
          entries: nextEntries,
        },
      };
    });
  }

  function handleRemoveAward(entryId: string, awardId: string) {
    updateSelectedEventState((current) => {
      const currentAward =
        current.draftEvent.entries
          .find((entry) => entry.id === entryId)
          ?.awards.find((award) => award.id === awardId) ?? null;
      const nextEntries = removeEntryAward(
        current.draftEvent.entries,
        entryId,
        awardId,
      );

      console.info("[show-manage][parent][handleRemoveAward]", {
        entryId,
        awardId,
        awardCode: currentAward?.code ?? "",
        before: getAwardLogEntries(
          current.draftEvent.entries.find((entry) => entry.id === entryId)
            ?.awards ?? [],
        ),
        after: getAwardLogEntries(
          nextEntries.find((entry) => entry.id === entryId)?.awards ?? [],
        ),
      });

      return {
        ...current,
        draftEvent: {
          ...cloneManageShowEvent(current.draftEvent),
          entries: nextEntries,
        },
      };
    });
  }

  function handleApplyEvent() {
    updateSelectedEventState((current) => ({
      ...current,
      appliedEvent: {
        ...cloneManageShowEvent(current.appliedEvent),
        eventDate: current.draftEvent.eventDate,
        eventPlace: current.draftEvent.eventPlace,
        eventCity: current.draftEvent.eventCity,
        eventName: current.draftEvent.eventName,
        eventType: current.draftEvent.eventType,
        organizer: current.draftEvent.organizer,
        judge: current.draftEvent.judge,
      },
      statusText: `${current.draftEvent.eventPlace} event changes applied locally.`,
    }));
  }

  function handleApplyEntry(entry: ManageShowEntry) {
    const applied = getAppliedEntry(appliedEvent, entry.id);
    if (applied && areShowEntriesEqual(entry, applied)) {
      return;
    }

    const { id: entryId, ...entryPatch } = entry;
    updateSelectedEventState((current) => ({
      ...current,
      appliedEvent: {
        ...cloneManageShowEvent(current.appliedEvent),
        entries: updateEntry(current.appliedEvent.entries, entryId, entryPatch),
      },
      statusText: `${entry.dogName} changes applied locally.`,
    }));
  }

  function handleRequestRemoveEntry(entry: ManageShowEntry) {
    updateSelectedEventState((current) => ({
      ...current,
      pendingRemovalEntry: {
        eventId: selectedEvent.id,
        entryId: entry.id,
        dogName: entry.dogName,
      },
    }));
  }

  function handleCancelRemove() {
    updateSelectedEventState((current) => ({
      ...current,
      pendingRemovalEntry: null,
    }));
  }

  function handleConfirmRemove() {
    if (!pendingRemovalEntry) {
      return;
    }

    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: {
        ...cloneManageShowEvent(current.draftEvent),
        entries: current.draftEvent.entries.filter(
          (entry) => entry.id !== pendingRemovalEntry.entryId,
        ),
      },
      appliedEvent: {
        ...cloneManageShowEvent(current.appliedEvent),
        entries: current.appliedEvent.entries.filter(
          (entry) => entry.id !== pendingRemovalEntry.entryId,
        ),
      },
      statusText: `${pendingRemovalEntry.dogName} removed from the selected event.`,
      pendingRemovalEntry: null,
    }));
  }

  function handleResetShell() {
    if (hasUnsavedChanges && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: cloneManageShowEvent(current.appliedEvent),
      statusText: "Local draft reset to the loaded event details.",
    }));
  }

  return {
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
  };
}
