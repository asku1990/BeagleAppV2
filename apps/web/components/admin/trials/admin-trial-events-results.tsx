"use client";

import React from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { cn } from "@/lib/utils";
import type { AdminTrialEventSummary } from "@beagle/contracts";
import { showDash } from "./internal/trial-ui";

type AdminTrialEventsResultsProps = {
  events: AdminTrialEventSummary[];
  selectedEventId?: string;
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  onSelectEvent: (trialEventId: string) => void;
  onPageDelta: (delta: number) => void;
};

export function AdminTrialEventsResults({
  events,
  selectedEventId,
  totalCount,
  page,
  totalPages,
  isLoading,
  isError,
  errorText,
  onSelectEvent,
  onPageDelta,
}: AdminTrialEventsResultsProps) {
  const { t } = useI18n();

  return (
    <ListingSectionShell
      title={t("admin.trials.manage.events.title")}
      subtitle={t("admin.trials.manage.events.subtitle")}
      count={`${totalCount} ${t("admin.trials.manage.events.countSuffix")}`}
    >
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">
              {t("admin.trials.manage.loading")}
            </CardContent>
          </Card>
        ) : null}

        {isError ? (
          <Card>
            <CardContent className="p-5 text-sm text-destructive">
              {errorText}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !isError ? (
          <EventResultsTable
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={onSelectEvent}
          />
        ) : null}

        {totalPages > 1 && !isLoading && !isError ? (
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageDelta(-1)}
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
              onClick={() => onPageDelta(1)}
            >
              {t("admin.trials.manage.pagination.next")}
            </Button>
          </div>
        ) : null}
      </div>
    </ListingSectionShell>
  );
}

function EventResultsTable({
  events,
  selectedEventId,
  onSelectEvent,
}: {
  events: AdminTrialEventSummary[];
  selectedEventId?: string;
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
