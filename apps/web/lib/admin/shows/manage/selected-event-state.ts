import { AdminMutationError } from "@/queries/admin/mutation-error";
import type { ManageShowEntry } from "@/components/admin/shows/manage/show-management-types";

export type PendingServerSync = {
  targetShowId: string;
  baselineUpdatedAt: number;
  statusText: string;
  successToast: string;
  clearPendingRemoval: boolean;
};

export function toMutationErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof AdminMutationError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function createEventSavedSyncPayload(input: {
  showId: string;
  eventPlace: string;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: `${input.eventPlace} event changes saved.`,
    successToast: "Event changes saved.",
    clearPendingRemoval: false,
  };
}

export function createEntrySavedSyncPayload(input: {
  showId: string;
  entry: ManageShowEntry;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: `${input.entry.dogName} changes saved.`,
    successToast: `${input.entry.dogName} changes saved.`,
    clearPendingRemoval: false,
  };
}

export function createEntryRemovedSyncPayload(input: {
  showId: string;
  dogName: string;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: `${input.dogName} removed from the selected event.`,
    successToast: `${input.dogName} removed from the selected event.`,
    clearPendingRemoval: true,
  };
}
