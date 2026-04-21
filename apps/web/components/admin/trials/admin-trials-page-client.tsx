"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  AdminTrialEventEntry,
  AdminTrialEventSearchRequest,
  AdminTrialEventSummary,
} from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { getTrialPdfHref } from "@/lib/public/beagle/trials";
import {
  useAdminTrialEventQuery,
  useAdminTrialEventsQuery,
} from "@/queries/admin/trials";
import { cn } from "@/lib/utils";

type SearchMode = "year" | "range";
type SearchSort = "date-desc" | "date-asc";

const DEFAULT_PAGE_SIZE = 20;
const EMPTY_EVENTS: AdminTrialEventSummary[] = [];
const EMPTY_ENTRIES: AdminTrialEventEntry[] = [];

function showDash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "-";
}

function formatPoints(value: number | null): string {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("fi-FI", {
    maximumFractionDigits: 2,
  }).format(value);
}

function parseYearInput(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!/^\d{4}$/.test(normalized)) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
    return null;
  }
  return parsed;
}

export function AdminTrialsPageClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>("year");
  const [query, setQuery] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SearchSort>("date-desc");
  const [searchRequest, setSearchRequest] =
    useState<AdminTrialEventSearchRequest>({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      sort: "date-desc",
      year: undefined,
    });
  const [selectedEventIdInput, setSelectedEventIdInput] = useState("");
  const [filterError, setFilterError] = useState<string | null>(null);

  const eventsQuery = useAdminTrialEventsQuery(searchRequest);
  const events = eventsQuery.data?.items ?? EMPTY_EVENTS;
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

  const selectedEvent = eventQuery.data?.event ?? null;
  const selectedEntries = selectedEvent?.entries ?? EMPTY_ENTRIES;

  const canSubmit = useMemo(() => {
    if (mode === "year") {
      return (
        yearInput.trim().length === 0 || parseYearInput(yearInput) !== null
      );
    }
    if (!dateFrom || !dateTo) return false;
    return dateFrom <= dateTo;
  }, [mode, yearInput, dateFrom, dateTo]);

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
        pageSize: DEFAULT_PAGE_SIZE,
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
      pageSize: DEFAULT_PAGE_SIZE,
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
      pageSize: DEFAULT_PAGE_SIZE,
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

      <ListingSectionShell
        title={t("admin.trials.manage.events.title")}
        subtitle={t("admin.trials.manage.events.subtitle")}
        count={`${totalCount} ${t("admin.trials.manage.events.countSuffix")}`}
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("admin.trials.manage.filters.placeholder")}
              aria-label={t("admin.trials.manage.filters.aria")}
            />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SearchSort)}
              aria-label={t("admin.trials.manage.filters.sort.label")}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="date-desc">
                {t("admin.trials.manage.filters.sort.dateDesc")}
              </option>
              <option value="date-asc">
                {t("admin.trials.manage.filters.sort.dateAsc")}
              </option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={mode}
              onChange={(event) => setMode(event.target.value as SearchMode)}
              aria-label={t("admin.trials.manage.filters.mode.label")}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="year">
                {t("admin.trials.manage.filters.mode.year")}
              </option>
              <option value="range">
                {t("admin.trials.manage.filters.mode.range")}
              </option>
            </select>

            {mode === "year" ? (
              <Input
                value={yearInput}
                onChange={(event) => setYearInput(event.target.value)}
                placeholder={t("admin.trials.manage.filters.year.placeholder")}
                aria-label={t("admin.trials.manage.filters.year.label")}
              />
            ) : (
              <>
                <Input
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  type="date"
                  aria-label={t("admin.trials.manage.filters.dateFrom")}
                />
                <Input
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  type="date"
                  aria-label={t("admin.trials.manage.filters.dateTo")}
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSubmitSearch} disabled={!canSubmit}>
              {t("admin.trials.manage.filters.apply")}
            </Button>
            <Button variant="outline" onClick={handleResetSearch}>
              {t("admin.trials.manage.filters.reset")}
            </Button>
          </div>

          {filterError ? (
            <p className="text-sm text-destructive">{filterError}</p>
          ) : null}

          {eventsQuery.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.manage.loading")}
              </CardContent>
            </Card>
          ) : null}

          {eventsQuery.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {eventsErrorText}
              </CardContent>
            </Card>
          ) : null}

          {!eventsQuery.isLoading && !eventsQuery.isError ? (
            <EventResults
              events={events}
              selectedEventId={selectedSummary?.trialEventId}
              onSelectEvent={setSelectedEventIdInput}
            />
          ) : null}

          {totalPages > 1 && !eventsQuery.isLoading && !eventsQuery.isError ? (
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageDelta(-1)}
              >
                {t("admin.trials.manage.pagination.previous")}
              </Button>
              <span>
                {t("admin.trials.manage.pagination.page")} {page} /{" "}
                {Math.max(totalPages, 1)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageDelta(1)}
              >
                {t("admin.trials.manage.pagination.next")}
              </Button>
            </div>
          ) : null}
        </div>
      </ListingSectionShell>

      <ListingSectionShell
        title={t("admin.trials.manage.selected.title")}
        subtitle={t("admin.trials.manage.selected.subtitle")}
      >
        <div className="space-y-3">
          {eventQuery.isError ? (
            <Card>
              <CardContent className="p-5 text-sm text-destructive">
                {selectedErrorText}
              </CardContent>
            </Card>
          ) : eventQuery.isLoading ? (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.manage.selected.loading")}
              </CardContent>
            </Card>
          ) : selectedEvent ? (
            <>
              <div className="rounded-md border p-4">
                <p className="text-sm font-medium">
                  {formatDateForFinland(selectedEvent.eventDate)} •{" "}
                  {selectedEvent.eventPlace}
                </p>
                <p className="text-sm text-muted-foreground">
                  {showDash(selectedEvent.eventName)} •{" "}
                  {showDash(selectedEvent.judge)} • {selectedEvent.dogCount}{" "}
                  {t("admin.trials.manage.selected.countSuffix")}
                </p>
              </div>
              <EntryResults
                entries={selectedEntries}
                onOpenTrialDetail={(trialId) =>
                  router.push(`/admin/trials/${encodeURIComponent(trialId)}`)
                }
              />
            </>
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                {t("admin.trials.manage.selected.empty")}
              </CardContent>
            </Card>
          )}
        </div>
      </ListingSectionShell>
    </div>
  );
}

function EventResults({
  events,
  selectedEventId,
  onSelectEvent,
}: {
  events: AdminTrialEventSummary[];
  selectedEventId: string | undefined;
  onSelectEvent: (trialEventId: string) => void;
}) {
  const { t } = useI18n();

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.trials.manage.events.empty")}
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">
                {t("admin.trials.manage.events.columns.date")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.events.columns.place")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.events.columns.name")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.events.columns.judge")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.events.columns.dogs")}
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isSelected = event.trialEventId === selectedEventId;
              return (
                <tr
                  key={event.trialEventId}
                  className={cn(
                    "border-b align-top cursor-pointer transition-colors focus-visible:bg-muted/40 focus-visible:outline-none",
                    isSelected ? "bg-muted/40" : "hover:bg-muted/20",
                  )}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => onSelectEvent(event.trialEventId)}
                  onKeyDown={(eventKey) => {
                    if (eventKey.key !== "Enter" && eventKey.key !== " ") {
                      return;
                    }
                    eventKey.preventDefault();
                    onSelectEvent(event.trialEventId);
                  }}
                >
                  <td className="px-2 py-2">
                    {formatDateForFinland(event.eventDate)}
                  </td>
                  <td className="px-2 py-2 font-medium">{event.eventPlace}</td>
                  <td className="px-2 py-2">{showDash(event.eventName)}</td>
                  <td className="px-2 py-2">{showDash(event.judge)}</td>
                  <td className="px-2 py-2">{event.dogCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
      mobile={events.map((event) => {
        const isSelected = event.trialEventId === selectedEventId;
        return (
          <Card
            key={event.trialEventId}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            onClick={() => onSelectEvent(event.trialEventId)}
            onKeyDown={(eventKey) => {
              if (eventKey.key !== "Enter" && eventKey.key !== " ") {
                return;
              }
              eventKey.preventDefault();
              onSelectEvent(event.trialEventId);
            }}
            className={cn(
              "cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "ring-1 ring-ring/40" : undefined,
            )}
          >
            <CardContent className="space-y-2 pt-4 text-sm">
              <p className="font-medium">{event.eventPlace}</p>
              <p>
                <span className="text-muted-foreground">
                  {t("admin.trials.manage.events.columns.date")}:
                </span>{" "}
                {formatDateForFinland(event.eventDate)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("admin.trials.manage.events.columns.name")}:
                </span>{" "}
                {showDash(event.eventName)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("admin.trials.manage.events.columns.judge")}:
                </span>{" "}
                {showDash(event.judge)}
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("admin.trials.manage.events.columns.dogs")}:
                </span>{" "}
                {event.dogCount}
              </p>
            </CardContent>
          </Card>
        );
      })}
    />
  );
}

function EntryResults({
  entries,
  onOpenTrialDetail,
}: {
  entries: AdminTrialEventEntry[];
  onOpenTrialDetail: (trialId: string) => void;
}) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.trials.manage.selected.emptyRows")}
      </p>
    );
  }

  return (
    <ListingResponsiveResults
      desktopClassName="overflow-x-auto"
      mobileClassName="space-y-3"
      desktop={
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.dog")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.registration")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.points")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.award")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.rank")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.judge")}
              </th>
              <th className="px-2 py-2">
                {t("admin.trials.manage.selected.columns.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.trialId} className="border-b align-top">
                <td className="px-2 py-2 font-medium">
                  {showDash(entry.dogName)}
                </td>
                <td className="px-2 py-2">{showDash(entry.registrationNo)}</td>
                <td className="px-2 py-2">{formatPoints(entry.points)}</td>
                <td className="px-2 py-2">{showDash(entry.award)}</td>
                <td className="px-2 py-2">{showDash(entry.rank)}</td>
                <td className="px-2 py-2">{showDash(entry.judge)}</td>
                <td className="px-2 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenTrialDetail(entry.trialId)}
                    >
                      {t("admin.trials.manage.selected.actions.openDetail")}
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={getTrialPdfHref(entry.trialId)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("admin.trials.manage.selected.actions.openPdf")}
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
      mobile={entries.map((entry) => (
        <Card key={entry.trialId}>
          <CardContent className="space-y-2 pt-4 text-sm">
            <p className="font-medium">{showDash(entry.dogName)}</p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.registration")}:
              </span>{" "}
              {showDash(entry.registrationNo)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.points")}:
              </span>{" "}
              {formatPoints(entry.points)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.award")}:
              </span>{" "}
              {showDash(entry.award)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.rank")}:
              </span>{" "}
              {showDash(entry.rank)}
            </p>
            <p>
              <span className="text-muted-foreground">
                {t("admin.trials.manage.selected.columns.judge")}:
              </span>{" "}
              {showDash(entry.judge)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onOpenTrialDetail(entry.trialId)}
              >
                {t("admin.trials.manage.selected.actions.openDetail")}
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={getTrialPdfHref(entry.trialId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("admin.trials.manage.selected.actions.openPdf")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    />
  );
}
