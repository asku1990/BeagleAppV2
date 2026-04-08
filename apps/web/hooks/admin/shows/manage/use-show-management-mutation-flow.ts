"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import {
  createEntryRemovedSyncPayload,
  createEntrySavedSyncPayload,
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
  type PendingEventSelectionSync = {
    targetShowId: string;
    baselineUpdatedAt: number;
  };

  const { t } = useI18n();
  const [applyingEntryId, setApplyingEntryId] = useState<string | null>(null);
  const [isRemovingEntry, setIsRemovingEntry] = useState(false);
  const [pendingServerSync, setPendingServerSync] =
    useState<PendingServerSync | null>(null);
  const [pendingEventSelectionSync, setPendingEventSelectionSync] =
    useState<PendingEventSelectionSync | null>(null);

  const updateEventMutation = useUpdateAdminShowEventMutation();
  const updateEntryMutation = useUpdateAdminShowEntryMutation();
  const deleteEntryMutation = useDeleteAdminShowEntryMutation();

  const isApplyingEvent = updateEventMutation.isPending;
  const isSyncingAfterSave =
    pendingServerSync !== null || pendingEventSelectionSync !== null;

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

  useEffect(() => {
    if (!pendingEventSelectionSync) {
      return;
    }
    if (selectedEvent.id !== pendingEventSelectionSync.targetShowId) {
      return;
    }
    if (selectedEventUpdatedAt <= pendingEventSelectionSync.baselineUpdatedAt) {
      return;
    }

    setPendingEventSelectionSync(null);
  }, [pendingEventSelectionSync, selectedEvent.id, selectedEventUpdatedAt]);

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
        setPendingEventSelectionSync({
          targetShowId: response.showId,
          baselineUpdatedAt: selectedEventUpdatedAt,
        });
        onSelectedEventIdChange(response.showId);
      }

      const statusText = `${response.eventPlace} ${t("admin.shows.manage.mutation.status.eventSavedSuffix")}`;
      onStatusTextChange(statusText);
      toast.success(t("admin.shows.manage.mutation.toast.eventSaved"));
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        t("admin.shows.manage.mutation.error.saveEvent"),
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
          statusText: `${entry.dogName} ${t("admin.shows.manage.mutation.status.entrySavedSuffix")}`,
          successToast: `${entry.dogName} ${t("admin.shows.manage.mutation.status.entrySavedSuffix")}`,
          selectedEventUpdatedAt,
        }),
      );
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `${entry.dogName} ${t("admin.shows.manage.mutation.error.saveEntrySuffix")}`,
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
          statusText: `${pendingRemovalEntry.dogName} ${t("admin.shows.manage.mutation.status.entryRemovedSuffix")}`,
          successToast: `${pendingRemovalEntry.dogName} ${t("admin.shows.manage.mutation.status.entryRemovedSuffix")}`,
          selectedEventUpdatedAt,
        }),
      );
      return true;
    } catch (error) {
      const message = toMutationErrorMessage(
        error,
        `${pendingRemovalEntry.dogName} ${t("admin.shows.manage.mutation.error.removeEntrySuffix")}`,
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
