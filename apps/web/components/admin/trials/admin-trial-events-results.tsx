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
import type { AdminTrialEventSummary } from "@beagle/contracts";
import { showDash } from "./internal/trial-ui";

type AdminTrialEventsResultsProps = {
  events: AdminTrialEventSummary[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  errorText: string;
  onOpenEvent: (trialEventId: string) => void;
  onPageDelta: (delta: number) => void;
};

export function AdminTrialEventsResults({
  events,
  totalCount,
  page,
  totalPages,
  isLoading,
  isError,
  errorText,
  onOpenEvent,
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
          <EventResultsTable events={events} onOpenEvent={onOpenEvent} />
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
  onOpenEvent,
}: {
  events: AdminTrialEventSummary[];
  onOpenEvent: (trialEventId: string) => void;
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
              return (
                <tr
                  key={event.trialEventId}
                  className="cursor-pointer border-b align-top transition-colors hover:bg-muted/20 focus-visible:bg-muted/40 focus-visible:outline-none"
                  role="link"
                  tabIndex={0}
                  onClick={() => onOpenEvent(event.trialEventId)}
                  onKeyDown={(eventKey) => {
                    if (eventKey.key !== "Enter") {
                      return;
                    }
                    eventKey.preventDefault();
                    onOpenEvent(event.trialEventId);
                  }}
                >
                  <td className="px-2 py-2">
                    {formatDateForFinland(event.eventDate)}
                  </td>
                  <td className="px-2 py-2 font-medium">{event.eventPlace}</td>
                  <td className="px-2 py-2">{showDash(event.eventName)}</td>
                  <td className="px-2 py-2">{showDash(event.ylituomari)}</td>
                  <td className="px-2 py-2">{event.dogCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
      mobile={events.map((event) => {
        return (
          <Card
            key={event.trialEventId}
            role="link"
            tabIndex={0}
            onClick={() => onOpenEvent(event.trialEventId)}
            onKeyDown={(eventKey) => {
              if (eventKey.key !== "Enter") {
                return;
              }
              eventKey.preventDefault();
              onOpenEvent(event.trialEventId);
            }}
            className="cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-ring"
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
                {showDash(event.ylituomari)}
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
