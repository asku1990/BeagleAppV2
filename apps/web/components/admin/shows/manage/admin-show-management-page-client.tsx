"use client";

// Event-first admin show management shell.
// Local mock state keeps the search, event editor, and remove flow interactive
// before the backend read/write layer is wired in.

import React, { useMemo, useState } from "react";
import { ListingSectionShell } from "@/components/listing";
import { Card } from "@/components/ui/card";
import {
  INITIAL_EVENTS,
  includesQuery,
  updateEntry,
  updateSelectedEvent,
} from "./show-management-fixtures";
import { ShowManagementEditorPanel } from "./show-management-editor-panel";
import { ShowManagementRemovePanel } from "./show-management-remove-panel";
import { ShowManagementSearchPanel } from "./show-management-search-panel";
import type {
  ManageShowEntry,
  ManageShowEvent,
  PendingRemovalEntry,
} from "./show-management-types";

export function AdminShowManagementPageClient() {
  // Local event state keeps the edit shell interactive before API reads/writes exist.
  const [events, setEvents] = useState<ManageShowEvent[]>(INITIAL_EVENTS);
  const [query, setQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0]?.id);
  const [pendingRemovalEntry, setPendingRemovalEntry] =
    useState<PendingRemovalEntry>(null);
  const [statusText, setStatusText] = useState("");

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return events;
    }

    return events.filter((event) => {
      const searchHaystack = [
        event.eventDate,
        event.eventPlace,
        event.eventCity,
        event.eventName,
        event.eventType,
        event.organizer,
        event.judge,
        ...event.entries.flatMap((entry) => [
          entry.registrationNo,
          entry.dogName,
          entry.judge,
          entry.critiqueText,
          entry.classCode,
          entry.qualityGrade,
          entry.showType,
          entry.pupn,
          entry.awards.join(", "),
        ]),
      ].join(" ");

      return includesQuery(searchHaystack, normalizedQuery);
    });
  }, [events, query]);

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ??
    filteredEvents[0] ??
    events[0] ??
    null;

  function handleSelectEvent(eventId: string) {
    setSelectedEventId(eventId);
    setStatusText("");
  }

  function handleEventFieldChange(
    field: keyof Omit<ManageShowEvent, "id" | "entries">,
    value: string,
  ) {
    if (!selectedEvent) {
      return;
    }

    setEvents((current) =>
      updateSelectedEvent(current, selectedEvent.id, (event) => ({
        ...event,
        [field]: value,
      })),
    );
  }

  function handleEntryFieldChange(
    entryId: string,
    patch: Partial<Omit<ManageShowEntry, "id">>,
  ) {
    if (!selectedEvent) {
      return;
    }

    setEvents((current) =>
      updateSelectedEvent(current, selectedEvent.id, (event) => ({
        ...event,
        entries: updateEntry(event.entries, entryId, patch),
      })),
    );
  }

  function handleRemoveEntryConfirmed() {
    if (!pendingRemovalEntry) {
      return;
    }

    setEvents((current) =>
      updateSelectedEvent(current, pendingRemovalEntry.eventId, (event) => ({
        ...event,
        entries: event.entries.filter(
          (entry) => entry.id !== pendingRemovalEntry.entryId,
        ),
      })),
    );
    setStatusText(
      `${pendingRemovalEntry.dogName} removed from local shell state.`,
    );
    setPendingRemovalEntry(null);
  }

  function handleResetShell() {
    setEvents(INITIAL_EVENTS);
    setSelectedEventId(INITIAL_EVENTS[0]?.id ?? "");
    setPendingRemovalEntry(null);
    setStatusText("Local draft reset to seeded demo data.");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Show management
        </h1>
        <p className="text-sm text-muted-foreground">
          Search shows, open one event, and edit its entries locally while the
          backend is still being built.
        </p>
      </div>

      <ListingSectionShell
        title="Event search"
        subtitle="Search uses event data plus dog names and registration numbers."
        count={`${filteredEvents.length} events`}
      >
        <div className="grid gap-3 lg:grid-cols-[1.1fr_1.5fr]">
          <ShowManagementSearchPanel
            events={filteredEvents}
            selectedEventId={selectedEvent?.id}
            query={query}
            onQueryChange={setQuery}
            onSelectEvent={handleSelectEvent}
          />

          {selectedEvent ? (
            <ShowManagementEditorPanel
              selectedEvent={selectedEvent}
              onEventFieldChange={handleEventFieldChange}
              onEntryChange={handleEntryFieldChange}
              onRequestRemoveEntry={(entry) =>
                setPendingRemovalEntry({
                  eventId: selectedEvent.id,
                  entryId: entry.id,
                  dogName: entry.dogName,
                })
              }
              onResetShell={handleResetShell}
              onSaveDraft={() => setStatusText("Draft saved locally.")}
              statusText={statusText}
            />
          ) : (
            <Card>
              <div className="p-5 text-sm text-muted-foreground">
                Select an event from the list.
              </div>
            </Card>
          )}
        </div>
      </ListingSectionShell>

      <ShowManagementRemovePanel
        pendingRemovalEntry={pendingRemovalEntry}
        onCancel={() => setPendingRemovalEntry(null)}
        onConfirm={handleRemoveEntryConfirmed}
      />
    </div>
  );
}
