"use client";

import React, { useState } from "react";
import type { AdminTrialEventSearchRequest } from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";
import { AdminTrialEventsFilters } from "./admin-trial-events-filters";
import { AdminTrialEventsResults } from "./admin-trial-events-results";
import { AdminTrialSelectedEventPanel } from "./admin-trial-selected-event-panel";
import {
  ADMIN_TRIAL_PAGE_SIZE,
  type AdminTrialSearchMode,
  type AdminTrialSearchSort,
  parseYearInput,
} from "./internal/trial-ui";
import {
  useAdminTrialEventQuery,
  useAdminTrialEventsQuery,
} from "@/queries/admin/trials";

export function AdminTrialsPageClient() {
  const { t } = useI18n();
  const [mode, setMode] = useState<AdminTrialSearchMode>("year");
  const [query, setQuery] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<AdminTrialSearchSort>("date-desc");
  const [searchRequest, setSearchRequest] =
    useState<AdminTrialEventSearchRequest>({
      page: 1,
      pageSize: ADMIN_TRIAL_PAGE_SIZE,
      sort: "date-desc",
      year: undefined,
    });
  const [selectedEventIdInput, setSelectedEventIdInput] = useState("");
  const [filterError, setFilterError] = useState<string | null>(null);

  const eventsQuery = useAdminTrialEventsQuery(searchRequest);
  const events = eventsQuery.data?.items ?? [];
  const totalCount = eventsQuery.data?.total ?? events.length;
  const totalPages = eventsQuery.data?.totalPages ?? 0;
  const page = eventsQuery.data?.page ?? 1;
  const selectedEventId = selectedEventIdInput || events[0]?.trialEventId || "";
  const selectedSummary =
    events.find((event) => event.trialEventId === selectedEventId) || null;

  const eventQuery = useAdminTrialEventQuery({
    trialEventId: selectedEventId,
    enabled: selectedEventId.length > 0,
  });

  function handleSubmitSearch() {
    if (mode === "year") {
      const parsedYear = parseYearInput(yearInput);
      if (yearInput.trim().length > 0 && parsedYear === null) {
        setFilterError(t("admin.trials.manage.filters.validation.year"));
        return;
      }

      setFilterError(null);
      setSearchRequest({
        query: query.trim() || undefined,
        year: parsedYear ?? undefined,
        dateFrom: undefined,
        dateTo: undefined,
        page: 1,
        pageSize: ADMIN_TRIAL_PAGE_SIZE,
        sort,
      });
      setSelectedEventIdInput("");
      return;
    }

    if (!dateFrom || !dateTo) {
      setFilterError(t("admin.trials.manage.filters.validation.range"));
      return;
    }

    if (dateFrom > dateTo) {
      setFilterError(t("admin.trials.manage.filters.validation.order"));
      return;
    }

    setFilterError(null);
    setSearchRequest({
      query: query.trim() || undefined,
      year: undefined,
      dateFrom,
      dateTo,
      page: 1,
      pageSize: ADMIN_TRIAL_PAGE_SIZE,
      sort,
    });
    setSelectedEventIdInput("");
  }

  function handleResetSearch() {
    setQuery("");
    setYearInput("");
    setDateFrom("");
    setDateTo("");
    setMode("year");
    setSort("date-desc");
    setFilterError(null);
    setSearchRequest({
      query: undefined,
      year: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      page: 1,
      pageSize: ADMIN_TRIAL_PAGE_SIZE,
      sort: "date-desc",
    });
    setSelectedEventIdInput("");
  }

  function handlePageDelta(delta: number) {
    setSearchRequest((current) => ({
      ...current,
      page: Math.max(1, (current.page ?? 1) + delta),
    }));
  }

  const eventsErrorText =
    eventsQuery.error instanceof Error
      ? eventsQuery.error.message
      : t("admin.trials.manage.error");
  const selectedErrorText =
    eventQuery.error instanceof Error
      ? eventQuery.error.message
      : t("admin.trials.manage.selected.error");

  return (
    <div className="space-y-4" suppressHydrationWarning>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.trials.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.trials.description")}
        </p>
      </div>

      <AdminTrialEventsFilters
        mode={mode}
        query={query}
        yearInput={yearInput}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sort={sort}
        filterError={filterError}
        onQueryChange={setQuery}
        onModeChange={setMode}
        onYearInputChange={setYearInput}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onSortChange={setSort}
        onApply={handleSubmitSearch}
        onReset={handleResetSearch}
      />

      <AdminTrialEventsResults
        events={events}
        selectedEventId={selectedSummary?.trialEventId}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        isLoading={eventsQuery.isLoading}
        isError={eventsQuery.isError}
        errorText={eventsErrorText}
        onSelectEvent={setSelectedEventIdInput}
        onPageDelta={handlePageDelta}
      />

      <AdminTrialSelectedEventPanel
        selectedEvent={eventQuery.data?.event ?? null}
        isLoading={eventQuery.isLoading}
        isError={eventQuery.isError}
        errorText={selectedErrorText}
      />
    </div>
  );
}
