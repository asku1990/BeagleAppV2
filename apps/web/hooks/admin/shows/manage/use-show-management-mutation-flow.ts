"use client";

import { useEffect, useState } from "react";
import {
  areShowEntriesEqual,
  createEntryRemovedSyncPayload,
  createEntrySavedSyncPayload,
  createEventSavedSyncPayload,
  getAppliedEntry,
  isEventInteractionBlocked,
  type PendingServerSync,
  toMutationErrorMessage,
} from "@/lib/admin/shows/manage";
import { toast } from "@/components/ui/sonner";
import {
  useDeleteAdminShowEntryMutation,
  useUpdateAdminShowEntryMutation,
  useUpdateAdminShowEventMutation,
} from "@/queries/admin/shows";
import type {
  ManageShowEntry,
  ManageShowEvent,
} from "@/components/admin/shows/manage/show-management-types";

export function useShowManagementMutationFlow({
  selectedEvent,
  selectedEventUpdatedAt,
  onSelectedEventIdChange,
  draftEvent,
  appliedEvent,
  pendingRemovalEntry,
  applyServerSnapshot,
  setStatusText,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  onSelectedEventIdChange: (nextShowId: string) => void;
  draftEvent: ManageShowEvent;
  appliedEvent: ManageShowEvent;
  pendingRemovalEntry: {
    eventId: string;
    entryId: string;
    dogName: string;
  } | null;
  applyServerSnapshot: (input: {
    selectedEventFromServer: ManageShowEvent;
    statusTextFromOperation: string;
    clearPendingRemoval: boolean;
  }) => void;
  setStatusText: (nextStatusText: string) => void;
}) {
  const [applyingEntryId, setApplyingEntryId] = useState<string | null>(null);
  const [isRemovingEntry, setIsRemovingEntry] = useState(false);
  const [pendingServerSync, setPendingServerSync] =
    useState<PendingServerSync | null>(null);

  const updateEventMutation = useUpdateAdminShowEventMutation();
  const updateEntryMutation = useUpdateAdminShowEntryMutation();
  const deleteEntryMutation = useDeleteAdminShowEntryMutation();

  const isApplyingEvent = updateEventMutation.isPending;
  const isSyncingAfterSave = pendingServerSync !== null;

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

    applyServerSnapshot({
      selectedEventFromServer: selectedEvent,
      clearPendingRemoval: pendingServerSync.clearPendingRemoval,
      statusTextFromOperation: pendingServerSync.statusText,
    });
    toast.success(pendingServerSync.successToast);
    setPendingServerSync(null);
  }, [
    applyServerSnapshot,
    pendingServerSync,
    selectedEvent,
    selectedEventUpdatedAt,
  ]);

  async function applyEventChanges() {
    if (
      isEventInteractionBlocked({
        isApplyingEvent,
        isSyncingAfterSave,
        applyingEntryId,
        isRemovingEntry,
      })
    ) {
      return;
    }

    try {
      const response = await updateEventMutation.mutateAsync({
        showId: draftEvent.id,
        eventDate: draftEvent.eventDate,
        eventPlace: draftEvent.eventPlace,
        eventCity: draftEvent.eventCity,
        eventName: draftEvent.eventName,
        eventType: draftEvent.eventType,
        organizer: draftEvent.organizer,
        judge: draftEvent.judge,
      });

      if (response.showId !== draftEvent.id) {
        onSelectedEventIdChange(response.showId);
      }

      setPendingServerSync(
        createEventSavedSyncPayload({
          showId: response.showId,
          eventPlace: response.eventPlace,
          selectedEventUpdatedAt,
        }),
      );
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        "Failed to save event changes.",
      );
      toast.error(message);
      setStatusText(message);
    }
  }

  async function applyEntryChanges(entry: ManageShowEntry) {
    if (
      isEventInteractionBlocked({
        isApplyingEvent,
        isSyncingAfterSave,
        applyingEntryId,
        isRemovingEntry,
      })
    ) {
      return;
    }

    const applied = getAppliedEntry(appliedEvent, entry.id);
    if (applied && areShowEntriesEqual(entry, applied)) {
      return;
    }

    setApplyingEntryId(entry.id);
    try {
      await updateEntryMutation.mutateAsync({
        showId: draftEvent.id,
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

      setPendingServerSync(
        createEntrySavedSyncPayload({
          showId: draftEvent.id,
          entry,
          selectedEventUpdatedAt,
        }),
      );
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `Failed to save ${entry.dogName} changes.`,
      );
      toast.error(message);
      setStatusText(message);
    } finally {
      setApplyingEntryId(null);
    }
  }

  async function confirmRemoveEntry() {
    if (
      !pendingRemovalEntry ||
      isEventInteractionBlocked({
        isApplyingEvent,
        isSyncingAfterSave,
        applyingEntryId,
        isRemovingEntry,
      })
    ) {
      return;
    }

    setIsRemovingEntry(true);
    try {
      await deleteEntryMutation.mutateAsync({
        showId: draftEvent.id,
        entryId: pendingRemovalEntry.entryId,
      });

      setPendingServerSync(
        createEntryRemovedSyncPayload({
          showId: draftEvent.id,
          dogName: pendingRemovalEntry.dogName,
          selectedEventUpdatedAt,
        }),
      );
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `Failed to remove ${pendingRemovalEntry.dogName} from the event.`,
      );
      toast.error(message);
      setStatusText(message);
    } finally {
      setIsRemovingEntry(false);
    }
  }

  return {
    isApplyingEvent,
    isSyncingAfterSave,
    applyingEntryId,
    isRemovingEntry,
    applyEventChanges,
    applyEntryChanges,
    confirmRemoveEntry,
  };
}
