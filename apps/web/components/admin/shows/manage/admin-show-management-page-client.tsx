"use client";

// Live admin show management shell.
// Search results and selected event details come from the read API; edits stay local until mutations exist.

import React, { useEffect, useState } from "react";
import type {
  AdminShowDetailsEvent,
  AdminShowEventSummary,
  AdminShowResultOptions,
} from "@beagle/contracts";
import { ListingSectionShell } from "@web/components/listing";
import { Card, CardContent } from "@web/components/ui/card";
import {
  areShowEntriesEqual,
  areShowEventFieldsEqual,
  getDirtyEntryIds,
  updateEntry,
} from "@web/lib/admin/shows/manage";
import { useAdminShowEventQuery } from "@web/queries/admin/shows/manage/use-admin-show-event-query";
import { useAdminShowEventsQuery } from "@web/queries/admin/shows/manage/use-admin-show-events-query";
import { ShowManagementEditorPanel } from "./show-management-editor-panel";
import { ShowManagementRemovePanel } from "./show-management-remove-panel";
import { ShowManagementSearchPanel } from "./show-management-search-panel";
import type {
  ManageShowEntry,
  ManageShowEditOptions,
  ManageShowEvent,
  PendingRemovalEntry,
} from "./show-management-types";

const DEFAULT_PAGE_SIZE = 20;
const EMPTY_SHOW_EVENTS: AdminShowEventSummary[] = [];
const EMPTY_SHOW_OPTIONS: ManageShowEditOptions = {
  classOptions: [],
  qualityOptions: [],
  awardOptions: [],
  pupnOptions: [],
};

function toManageShowEvent(show: AdminShowDetailsEvent): ManageShowEvent {
  return {
    id: show.showId,
    eventDate: show.eventDate,
    eventPlace: show.eventPlace,
    eventCity: show.eventCity,
    eventName: show.eventName,
    eventType: show.eventType,
    organizer: show.organizer,
    judge: show.judge,
    entries: show.entries.map((entry) => {
      return {
        ...entry,
        awards: [...entry.awards],
      };
    }),
  };
}

function cloneManageShowEvent(event: ManageShowEvent): ManageShowEvent {
  return {
    ...event,
    entries: event.entries.map((entry) => ({
      ...entry,
      awards: [...entry.awards],
    })),
  };
}

function cloneManageShowEditOptions(
  options: ManageShowEditOptions,
): ManageShowEditOptions {
  return {
    classOptions: options.classOptions.map((option) => ({ ...option })),
    qualityOptions: options.qualityOptions.map((option) => ({ ...option })),
    awardOptions: options.awardOptions.map((option) => ({ ...option })),
    pupnOptions: options.pupnOptions.map((option) => ({ ...option })),
  };
}

function toManageShowEditOptions(
  options: AdminShowResultOptions | null | undefined,
): ManageShowEditOptions {
  if (!options) {
    return cloneManageShowEditOptions(EMPTY_SHOW_OPTIONS);
  }
  return cloneManageShowEditOptions({
    classOptions: options.classOptions,
    qualityOptions: options.qualityOptions,
    awardOptions: options.awardOptions,
    pupnOptions: options.pupnOptions,
  });
}

function getAppliedEntry(
  event: ManageShowEvent | null,
  entryId: string,
): ManageShowEntry | undefined {
  return event?.entries.find((item) => item.id === entryId);
}

type EventLocalState = {
  draftEvent: ManageShowEvent;
  appliedEvent: ManageShowEvent;
  pendingRemovalEntry: PendingRemovalEntry;
  statusText: string;
};

function createEventLocalState(event: ManageShowEvent): EventLocalState {
  return {
    draftEvent: cloneManageShowEvent(event),
    appliedEvent: cloneManageShowEvent(event),
    pendingRemovalEntry: null,
    statusText: "",
  };
}

function AdminShowManagementSelectedEventPanel({
  selectedEvent,
  resultOptions,
}: {
  selectedEvent: ManageShowEvent;
  resultOptions: ManageShowEditOptions;
}) {
  const [eventStateById, setEventStateById] = useState<
    Record<string, EventLocalState>
  >(() => ({
    [selectedEvent.id]: createEventLocalState(selectedEvent),
  }));

  const selectedEventState =
    eventStateById[selectedEvent.id] ?? createEventLocalState(selectedEvent);
  const { draftEvent, appliedEvent, pendingRemovalEntry, statusText } =
    selectedEventState;

  function updateSelectedEventState(
    update: (current: EventLocalState) => EventLocalState,
  ) {
    setEventStateById((current) => {
      const selectedState =
        current[selectedEvent.id] ?? createEventLocalState(selectedEvent);
      return {
        ...current,
        [selectedEvent.id]: update(selectedState),
      };
    });
  }

  const isEventDirty = Boolean(
    draftEvent &&
    appliedEvent &&
    !areShowEventFieldsEqual(draftEvent, appliedEvent),
  );
  const dirtyEntryIds = getDirtyEntryIds(draftEvent, appliedEvent ?? undefined);
  const hasUnsavedChanges =
    !areShowEventFieldsEqual(draftEvent, appliedEvent) ||
    dirtyEntryIds.length > 0;

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
    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: {
        ...cloneManageShowEvent(current.draftEvent),
        [field]: value,
      },
    }));
  }

  function handleEntryFieldChange(
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) {
    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: {
        ...cloneManageShowEvent(current.draftEvent),
        entries: updateEntry(current.draftEvent.entries, entryId, patch),
      },
    }));
  }

  function handleApplyEventChanges() {
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

  function handleApplyEntryChanges(entry: ManageShowEntry) {
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

  function handleRemoveEntryConfirmed() {
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

  function handleResetChanges() {
    if (hasUnsavedChanges && !window.confirm("Discard unsaved changes?")) {
      return;
    }

    updateSelectedEventState((current) => ({
      ...current,
      draftEvent: cloneManageShowEvent(current.appliedEvent),
      statusText: "Local draft reset to the loaded event details.",
    }));
  }

  return (
    <>
      <ShowManagementEditorPanel
        selectedEvent={draftEvent}
        resultOptions={resultOptions}
        isEventDirty={isEventDirty}
        dirtyEntryIds={dirtyEntryIds}
        onEventFieldChange={handleEventFieldChange}
        onEntryChange={handleEntryFieldChange}
        onApplyEvent={handleApplyEventChanges}
        onApplyEntry={handleApplyEntryChanges}
        onRequestRemoveEntry={(entry) =>
          updateSelectedEventState((current) => ({
            ...current,
            pendingRemovalEntry: {
              eventId: selectedEvent.id,
              entryId: entry.id,
              dogName: entry.dogName,
            },
          }))
        }
        onResetShell={handleResetChanges}
        statusText={statusText}
      />

      <ShowManagementRemovePanel
        pendingRemovalEntry={pendingRemovalEntry}
        onCancel={() =>
          updateSelectedEventState((current) => ({
            ...current,
            pendingRemovalEntry: null,
          }))
        }
        onConfirm={handleRemoveEntryConfirmed}
      />
    </>
  );
}

export function AdminShowManagementPageClient() {
  const [query, setQuery] = useState("");
  const [selectedEventIdInput, setSelectedEventIdInput] = useState("");

  const searchQuery = useAdminShowEventsQuery({
    query: query.trim() || undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: "date-desc",
  });

  const showEvents = searchQuery.data?.items ?? EMPTY_SHOW_EVENTS;
  const selectedEventId =
    showEvents.find((event) => event.showId === selectedEventIdInput)?.showId ??
    showEvents[0]?.showId ??
    "";
  const selectedSummary =
    showEvents.find((event) => event.showId === selectedEventId) ??
    showEvents[0] ??
    null;

  const detailQuery = useAdminShowEventQuery({
    showId: selectedEventId,
    enabled: selectedEventId.length > 0,
  });
  const selectedEventFromApi = detailQuery.data?.show ?? null;
  const resultOptions = toManageShowEditOptions(detailQuery.data?.options);
  const selectedEvent = selectedEventFromApi
    ? toManageShowEvent(selectedEventFromApi)
    : null;
  const isDetailLoading =
    Boolean(selectedEventId) &&
    detailQuery.isLoading &&
    !selectedEvent &&
    !detailQuery.isError;
  const searchErrorText =
    searchQuery.error instanceof Error
      ? searchQuery.error.message
      : "Failed to load admin show events.";
  const detailErrorText =
    detailQuery.error instanceof Error
      ? detailQuery.error.message
      : "Failed to load admin show details.";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Show management
        </h1>
        <p className="text-sm text-muted-foreground">
          Search shows, open one event, and edit its entries from the live read
          layer.
        </p>
      </div>

      <ListingSectionShell
        title="Event search"
        subtitle="Search uses live event data plus dog counts from the admin read endpoint."
        count={`${searchQuery.data?.total ?? showEvents.length} events`}
      >
        <div className="grid gap-3 lg:grid-cols-[1.1fr_1.5fr]">
          <div className="space-y-3">
            {searchQuery.isError && showEvents.length === 0 ? (
              <Card>
                <CardContent className="p-5 text-sm text-destructive">
                  {searchErrorText}
                </CardContent>
              </Card>
            ) : null}

            <ShowManagementSearchPanel
              events={showEvents}
              selectedEventId={selectedSummary?.showId}
              query={query}
              onQueryChange={setQuery}
              onSelectEvent={(eventId) => setSelectedEventIdInput(eventId)}
            />
          </div>

          <div className="space-y-3">
            {detailQuery.isError ? (
              <Card>
                <CardContent className="p-5 text-sm text-destructive">
                  {detailErrorText}
                </CardContent>
              </Card>
            ) : isDetailLoading ? (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Loading selected event details...
                </CardContent>
              </Card>
            ) : selectedEvent ? (
              <AdminShowManagementSelectedEventPanel
                selectedEvent={selectedEvent}
                resultOptions={resultOptions}
              />
            ) : (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  {showEvents.length === 0
                    ? "No shows match the current search."
                    : "Select an event from the list."}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ListingSectionShell>
    </div>
  );
}
