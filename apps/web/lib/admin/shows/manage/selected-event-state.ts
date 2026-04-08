import { AdminMutationError } from "@/queries/admin/mutation-error";

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
  statusText: string;
  successToast: string;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: input.statusText,
    successToast: input.successToast,
    clearPendingRemoval: false,
  };
}

export function createEntrySavedSyncPayload(input: {
  showId: string;
  statusText: string;
  successToast: string;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: input.statusText,
    successToast: input.successToast,
    clearPendingRemoval: false,
  };
}

export function createEntryRemovedSyncPayload(input: {
  showId: string;
  statusText: string;
  successToast: string;
  selectedEventUpdatedAt: number;
}): PendingServerSync {
  return {
    targetShowId: input.showId,
    baselineUpdatedAt: input.selectedEventUpdatedAt,
    statusText: input.statusText,
    successToast: input.successToast,
    clearPendingRemoval: true,
  };
}
