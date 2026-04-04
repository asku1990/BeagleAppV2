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
  getDirtyEntryIds,
  removeEntryAward,
  updateDraftEntryField,
  updateDraftEventField,
} from "@web/lib/admin/shows/manage";
import { toast } from "@/components/ui/sonner";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import {
  useDeleteAdminShowEntryMutation,
  useUpdateAdminShowEntryMutation,
  useUpdateAdminShowEventMutation,
} from "@/queries/admin/shows";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

type PendingServerSync = {
  targetShowId: string;
  baselineUpdatedAt: number;
  statusText: string;
  successToast: string;
  clearPendingRemoval: boolean;
};

export function useShowManagementSelectedEventState({
  selectedEvent,
  selectedEventUpdatedAt,
  onSelectedEventIdChange,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  onSelectedEventIdChange: (nextShowId: string) => void;
}) {
  const [eventStateById, setEventStateById] = useState(() => ({
    [selectedEvent.id]: createEventLocalState(selectedEvent),
  }));
  const [applyingEntryId, setApplyingEntryId] = useState<string | null>(null);
  const [isRemovingEntry, setIsRemovingEntry] = useState(false);
  const [pendingServerSync, setPendingServerSync] =
    useState<PendingServerSync | null>(null);
  const updateEventMutation = useUpdateAdminShowEventMutation();
  const updateEntryMutation = useUpdateAdminShowEntryMutation();
  const deleteEntryMutation = useDeleteAdminShowEntryMutation();

  const selectedEventState =
    eventStateById[selectedEvent.id] ?? createEventLocalState(selectedEvent);
  const { draftEvent, appliedEvent, pendingRemovalEntry, statusText } =
    selectedEventState;

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
  const isApplyingEvent = updateEventMutation.isPending;
  const isSyncingAfterSave = pendingServerSync !== null;
  const hasUnsavedChanges = isEventDirty || dirtyEntryIds.length > 0;

  function toMutationErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof AdminMutationError) {
      return error.message || fallback;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  }

  useEffect(() => {
    setEventStateById((current) => {
      if (current[selectedEvent.id]) {
        return current;
      }
      return {
        ...current,
        [selectedEvent.id]: createEventLocalState(selectedEvent),
      };
    });
  }, [selectedEvent]);

  useEffect(() => {
    if (!pendingServerSync) {
      return;
    }
    if (pendingServerSync.targetShowId !== selectedEvent.id) {
      return;
    }
    if (selectedEventUpdatedAt <= pendingServerSync.baselineUpdatedAt) {
      return;
    }

    setEventStateById((current) => ({
      ...current,
      [selectedEvent.id]: {
        ...createEventLocalState(selectedEvent),
        pendingRemovalEntry: pendingServerSync.clearPendingRemoval
          ? null
          : (current[selectedEvent.id]?.pendingRemovalEntry ?? null),
        statusText: pendingServerSync.statusText,
      },
    }));
    toast.success(pendingServerSync.successToast);
    setPendingServerSync(null);
  }, [pendingServerSync, selectedEvent, selectedEventUpdatedAt]);

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
    if (isApplyingEvent || isSyncingAfterSave) {
      return;
    }
    updateSelectedEventState((current) =>
      updateDraftEventField(current, field, value),
    );
  }

  function handleEntryFieldChange(
    entryId: string,
    field: keyof Omit<ManageShowEntry, "id" | "awards">,
    value: string,
  ) {
    if (
      isApplyingEvent ||
      isRemovingEntry ||
      isSyncingAfterSave ||
      applyingEntryId === entryId
    ) {
      return;
    }
    updateSelectedEventState((current) =>
      updateDraftEntryField(current, entryId, field, value),
    );
  }

  function handleAddAward(entryId: string, awardCode: string) {
    if (
      isApplyingEvent ||
      isRemovingEntry ||
      isSyncingAfterSave ||
      applyingEntryId === entryId
    ) {
      return;
    }
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

  function handleRemoveAward(entryId: string, awardId: string) {
    if (
      isApplyingEvent ||
      isRemovingEntry ||
      isSyncingAfterSave ||
      applyingEntryId === entryId
    ) {
      return;
    }
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

  async function handleApplyEvent() {
    if (
      isApplyingEvent ||
      isSyncingAfterSave ||
      applyingEntryId ||
      isRemovingEntry
    ) {
      return;
    }

    const eventSnapshot = selectedEventState.draftEvent;
    try {
      const response = await updateEventMutation.mutateAsync({
        showId: eventSnapshot.id,
        eventDate: eventSnapshot.eventDate,
        eventPlace: eventSnapshot.eventPlace,
        eventCity: eventSnapshot.eventCity,
        eventName: eventSnapshot.eventName,
        eventType: eventSnapshot.eventType,
        organizer: eventSnapshot.organizer,
        judge: eventSnapshot.judge,
      });

      if (response.showId !== eventSnapshot.id) {
        onSelectedEventIdChange(response.showId);
      }
      setPendingServerSync({
        targetShowId: response.showId,
        baselineUpdatedAt: selectedEventUpdatedAt,
        statusText: `${response.eventPlace} event changes saved.`,
        successToast: "Event changes saved.",
        clearPendingRemoval: false,
      });
    } catch (error) {
      toast.error(
        toMutationErrorMessage(error, "Failed to save event changes."),
      );
      updateSelectedEventState((current) => ({
        ...current,
        statusText: toMutationErrorMessage(
          error,
          "Failed to save event changes.",
        ),
      }));
    }
  }

  async function handleApplyEntry(entry: ManageShowEntry) {
    if (
      isApplyingEvent ||
      isSyncingAfterSave ||
      isRemovingEntry ||
      applyingEntryId
    ) {
      return;
    }

    const applied = getAppliedEntry(appliedEvent, entry.id);
    if (applied && areShowEntriesEqual(entry, applied)) {
      return;
    }

    const eventSnapshot = selectedEventState.draftEvent;
    setApplyingEntryId(entry.id);
    try {
      await updateEntryMutation.mutateAsync({
        showId: eventSnapshot.id,
        entryId: entry.id,
        judge: entry.judge,
        critiqueText: entry.critiqueText,
        heightCm: entry.heightCm,
        classCode: entry.classCode,
        qualityGrade: entry.qualityGrade,
        classPlacement: entry.classPlacement,
        pupn: entry.pupn,
        awards: entry.awards.map((award) => award.code),
      });

      setPendingServerSync({
        targetShowId: eventSnapshot.id,
        baselineUpdatedAt: selectedEventUpdatedAt,
        statusText: `${entry.dogName} changes saved.`,
        successToast: `${entry.dogName} changes saved.`,
        clearPendingRemoval: false,
      });
    } catch (error) {
      toast.error(
        toMutationErrorMessage(
          error,
          `Failed to save ${entry.dogName} changes.`,
        ),
      );
      updateSelectedEventState((current) => ({
        ...current,
        statusText: toMutationErrorMessage(
          error,
          `Failed to save ${entry.dogName} changes.`,
        ),
      }));
    } finally {
      setApplyingEntryId(null);
    }
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

  async function handleConfirmRemove() {
    if (
      !pendingRemovalEntry ||
      isApplyingEvent ||
      isSyncingAfterSave ||
      isRemovingEntry ||
      applyingEntryId
    ) {
      return;
    }

    const eventSnapshot = selectedEventState.draftEvent;
    const pendingSnapshot = pendingRemovalEntry;
    setIsRemovingEntry(true);
    try {
      await deleteEntryMutation.mutateAsync({
        showId: eventSnapshot.id,
        entryId: pendingSnapshot.entryId,
      });
      setPendingServerSync({
        targetShowId: eventSnapshot.id,
        baselineUpdatedAt: selectedEventUpdatedAt,
        statusText: `${pendingSnapshot.dogName} removed from the selected event.`,
        successToast: `${pendingSnapshot.dogName} removed from the selected event.`,
        clearPendingRemoval: true,
      });
    } catch (error) {
      toast.error(
        toMutationErrorMessage(
          error,
          `Failed to remove ${pendingSnapshot.dogName} from the event.`,
        ),
      );
      updateSelectedEventState((current) => ({
        ...current,
        statusText: toMutationErrorMessage(
          error,
          `Failed to remove ${pendingSnapshot.dogName} from the event.`,
        ),
      }));
    } finally {
      setIsRemovingEntry(false);
    }
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
    isApplyingEvent,
    isSyncingAfterSave,
    applyingEntryId,
    isRemovingEntry,
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
