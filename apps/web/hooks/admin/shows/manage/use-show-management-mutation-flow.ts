"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import {
  createEntryRemovedSyncPayload,
  createEntrySavedSyncPayload,
  createEventSavedSyncPayload,
  toMutationErrorMessage,
  type PendingServerSync,
} from "@/lib/admin/shows/manage";
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
  onStatusTextChange,
  onRemoveConfirmed,
}: {
  selectedEvent: ManageShowEvent;
  selectedEventUpdatedAt: number;
  onSelectedEventIdChange: (nextShowId: string) => void;
  onStatusTextChange: (nextStatusText: string) => void;
  onRemoveConfirmed: () => void;
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
      // The user switched selection before the original save sync resolved.
      // Clear stale sync state so the new selection is not blocked.
      setPendingServerSync(null);
      return;
    }
    if (selectedEventUpdatedAt <= pendingServerSync.baselineUpdatedAt) {
      return;
    }

    onStatusTextChange(pendingServerSync.statusText);
    toast.success(pendingServerSync.successToast);
    if (pendingServerSync.clearPendingRemoval) {
      onRemoveConfirmed();
    }
    setPendingServerSync(null);
  }, [
    onRemoveConfirmed,
    onStatusTextChange,
    pendingServerSync,
    selectedEvent.id,
    selectedEventUpdatedAt,
  ]);

  async function applyEventChanges(draftEvent: ManageShowEvent) {
    if (
      isApplyingEvent ||
      isSyncingAfterSave ||
      Boolean(applyingEntryId) ||
      isRemovingEntry
    ) {
      return false;
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
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        "Failed to save event changes.",
      );
      toast.error(message);
      onStatusTextChange(message);
      return false;
    }
  }

  async function applyEntryChanges(entry: ManageShowEntry) {
    if (
      isApplyingEvent ||
      isSyncingAfterSave ||
      Boolean(applyingEntryId) ||
      isRemovingEntry
    ) {
      return false;
    }

    setApplyingEntryId(entry.id);
    try {
      await updateEntryMutation.mutateAsync({
        showId: selectedEvent.id,
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
          showId: selectedEvent.id,
          entry,
          selectedEventUpdatedAt,
        }),
      );
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `Failed to save ${entry.dogName} changes.`,
      );
      toast.error(message);
      onStatusTextChange(message);
      return false;
    } finally {
      setApplyingEntryId(null);
    }
  }

  async function confirmRemoveEntry(
    pendingRemovalEntry: {
      eventId: string;
      entryId: string;
      dogName: string;
    } | null,
  ) {
    if (
      !pendingRemovalEntry ||
      isApplyingEvent ||
      isSyncingAfterSave ||
      Boolean(applyingEntryId) ||
      isRemovingEntry
    ) {
      return false;
    }

    setIsRemovingEntry(true);
    try {
      await deleteEntryMutation.mutateAsync({
        showId: selectedEvent.id,
        entryId: pendingRemovalEntry.entryId,
      });

      onRemoveConfirmed();
      setPendingServerSync(
        createEntryRemovedSyncPayload({
          showId: selectedEvent.id,
          dogName: pendingRemovalEntry.dogName,
          selectedEventUpdatedAt,
        }),
      );
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `Failed to remove ${pendingRemovalEntry.dogName} from the event.`,
      );
      toast.error(message);
      onStatusTextChange(message);
      return false;
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
