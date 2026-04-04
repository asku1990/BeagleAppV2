"use client";

import React, { useState } from "react";
import type { AdminShowEventSummary } from "@beagle/contracts";
import { ListingSectionShell } from "@web/components/listing";
import { Card, CardContent } from "@web/components/ui/card";
import {
  toManageShowEditOptions,
  toManageShowEvent,
} from "@web/lib/admin/shows/manage";
import { useAdminShowEventQuery } from "@web/queries/admin/shows/manage/use-admin-show-event-query";
import { useAdminShowEventsQuery } from "@web/queries/admin/shows/manage/use-admin-show-events-query";
import { ShowManagementSearchPanel } from "./show-management-search-panel";
import { ShowManagementSelectedEventPanel } from "./show-management-selected-event-panel";

const DEFAULT_PAGE_SIZE = 20;
const EMPTY_SHOW_EVENTS: AdminShowEventSummary[] = [];

export function AdminShowManagementPageClient() {
  const [query, setQuery] = useState("");
  const [selectedEventIdInput, setSelectedEventIdInput] = useState("");
  const [hasMounted, setHasMounted] = useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const searchQuery = useAdminShowEventsQuery({
    query: query.trim() || undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sort: "date-desc",
  });

  const showEvents = searchQuery.data?.items ?? EMPTY_SHOW_EVENTS;
  const selectedEventId = selectedEventIdInput || showEvents[0]?.showId || "";
  const selectedSummary =
    showEvents.find((event) => event.showId === selectedEventId) ||
    (!selectedEventIdInput ? showEvents[0] : null);

  const detailQuery = useAdminShowEventQuery({
    showId: selectedEventId,
    enabled: selectedEventId.length > 0,
  });
  const selectedEvent = detailQuery.data?.show
    ? toManageShowEvent(detailQuery.data.show)
    : null;
  const resultOptions = toManageShowEditOptions(detailQuery.data?.options);
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
  const shouldRenderInteractiveDetail = hasMounted;

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
            {!shouldRenderInteractiveDetail ? (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Loading selected event details...
                </CardContent>
              </Card>
            ) : detailQuery.isError ? (
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
              <ShowManagementSelectedEventPanel
                selectedEvent={selectedEvent}
                selectedEventUpdatedAt={detailQuery.dataUpdatedAt}
                resultOptions={resultOptions}
                onSelectedEventIdChange={setSelectedEventIdInput}
              />
            ) : (
              <Card>
                <CardContent className="p-5 text-sm text-muted-foreground">
                  Search for an event and pick one from the results to inspect
                  its entries.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ListingSectionShell>
    </div>
  );
}
