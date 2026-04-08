"use client";

import React, { useState } from "react";
import type { AdminShowEventSummary } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import {
  toManageShowEditOptions,
  toManageShowEvent,
} from "@/lib/admin/shows/manage";
import { useAdminShowEventQuery } from "@/queries/admin/shows/manage/use-admin-show-event-query";
import { useAdminShowEventsQuery } from "@/queries/admin/shows/manage/use-admin-show-events-query";
import { ShowManagementFilters } from "./show-management-filters";
import { ShowManagementResults } from "./show-management-results";
import { ShowManagementSelectedEventPanel } from "./show-management-selected-event-panel";

const DEFAULT_PAGE_SIZE = 20;
const EMPTY_SHOW_EVENTS: AdminShowEventSummary[] = [];

export function AdminShowManagementPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [selectedEventIdInput, setSelectedEventIdInput] = useState("");
  const [statusText, setStatusText] = useState("");
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
      : t("admin.shows.manage.error.events");
  const detailErrorText =
    detailQuery.error instanceof Error
      ? detailQuery.error.message
      : t("admin.shows.manage.error.details");
  const shouldRenderInteractiveDetail = hasMounted;

  function handleSelectEvent(eventId: string) {
    setStatusText("");
    setSelectedEventIdInput(eventId);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.shows.manage.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.shows.manage.description")}
        </p>
      </div>

      <ListingSectionShell
        title={t("admin.shows.manage.events.title")}
        subtitle={t("admin.shows.manage.events.subtitle")}
        count={`${searchQuery.data?.total ?? showEvents.length} ${t("admin.shows.manage.events.countSuffix")}`}
      >
        <div className="space-y-3">
          {searchQuery.isError && showEvents.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {searchErrorText}
              </CardContent>
            </Card>
          ) : null}

          <ShowManagementFilters query={query} onQueryChange={setQuery} />
          <ShowManagementResults
            events={showEvents}
            selectedEventId={selectedSummary?.showId}
            onSelectEvent={handleSelectEvent}
          />
        </div>
      </ListingSectionShell>

      <ListingSectionShell
        title={t("admin.shows.manage.selected.title")}
        subtitle={t("admin.shows.manage.selected.subtitle")}
      >
        <div className="space-y-3">
          {!shouldRenderInteractiveDetail ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.shows.manage.loading.details")}
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
                {t("admin.shows.manage.loading.details")}
              </CardContent>
            </Card>
          ) : selectedEvent ? (
            <ShowManagementSelectedEventPanel
              key={selectedEvent.id}
              selectedEvent={selectedEvent}
              selectedEventUpdatedAt={detailQuery.dataUpdatedAt}
              resultOptions={resultOptions}
              statusText={statusText}
              onStatusTextChange={setStatusText}
              onSelectedEventIdChange={setSelectedEventIdInput}
            />
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.shows.manage.empty.details")}
              </CardContent>
            </Card>
          )}
        </div>
      </ListingSectionShell>
    </div>
  );
}
