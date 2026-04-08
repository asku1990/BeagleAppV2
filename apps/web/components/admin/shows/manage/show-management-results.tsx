"use client";

import type React from "react";
import type { AdminShowEventSummary } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import { formatDateForFinland } from "@/lib/admin/core/date";
import { cn } from "@/lib/utils";

function formatText(value: string): string {
  const normalized = value.trim();
  return normalized || "-";
}

function isActivationKey(event: React.KeyboardEvent<HTMLElement>): boolean {
  return event.key === "Enter" || event.key === " ";
}

export function ShowManagementResults({
  events,
  selectedEventId,
  onSelectEvent,
}: {
  events: AdminShowEventSummary[];
  selectedEventId: string | undefined;
  onSelectEvent: (showId: string) => void;
}) {
  const { t } = useI18n();

  function eventSelectAriaLabel(eventPlace: string): string {
    return `${t("admin.shows.manage.results.selectEventAriaPrefix")} ${eventPlace}`;
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("admin.shows.manage.results.empty")}
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
                {t("admin.shows.manage.results.date")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.place")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.city")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.type")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.event")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.organizer")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.judge")}
              </th>
              <th className="px-2 py-2">
                {t("admin.shows.manage.results.dogs")}
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isSelected = event.showId === selectedEventId;
              return (
                <tr
                  key={event.showId}
                  onClick={() => onSelectEvent(event.showId)}
                  onKeyDown={(keyboardEvent) => {
                    if (!isActivationKey(keyboardEvent)) {
                      return;
                    }

                    keyboardEvent.preventDefault();
                    onSelectEvent(event.showId);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={eventSelectAriaLabel(event.eventPlace)}
                  aria-pressed={isSelected}
                  className={cn(
                    "border-b align-top cursor-pointer transition-colors focus-visible:bg-muted/40 focus-visible:outline-none",
                    isSelected ? "bg-muted/40" : "hover:bg-muted/20",
                  )}
                >
                  <td className="px-2 py-2">
                    {formatDateForFinland(event.eventDate)}
                  </td>
                  <td className="px-2 py-2 font-medium">{event.eventPlace}</td>
                  <td className="px-2 py-2">{formatText(event.eventCity)}</td>
                  <td className="px-2 py-2">{formatText(event.eventType)}</td>
                  <td className="px-2 py-2">{event.eventName}</td>
                  <td className="px-2 py-2">{formatText(event.organizer)}</td>
                  <td className="px-2 py-2">{formatText(event.judge)}</td>
                  <td className="px-2 py-2">{event.dogCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      }
      mobile={events.map((event) => {
        const isSelected = event.showId === selectedEventId;

        return (
          <Card
            key={event.showId}
            role="button"
            tabIndex={0}
            aria-label={eventSelectAriaLabel(event.eventPlace)}
            aria-pressed={isSelected}
            onClick={() => onSelectEvent(event.showId)}
            onKeyDown={(keyboardEvent) => {
              if (!isActivationKey(keyboardEvent)) {
                return;
              }

              keyboardEvent.preventDefault();
              onSelectEvent(event.showId);
            }}
            className={cn(
              "transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              "cursor-pointer",
              isSelected ? "ring-1 ring-ring/40" : undefined,
            )}
          >
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{event.eventPlace}</p>
                </div>
                {isSelected ? (
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {t("admin.shows.manage.results.selected")}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.date")}:
                  </span>{" "}
                  {formatDateForFinland(event.eventDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.place")}:
                  </span>{" "}
                  {event.eventPlace}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.city")}:
                  </span>{" "}
                  {formatText(event.eventCity)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.type")}:
                  </span>{" "}
                  {formatText(event.eventType)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.event")}:
                  </span>{" "}
                  {event.eventName}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.organizer")}:
                  </span>{" "}
                  {formatText(event.organizer)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.judge")}:
                  </span>{" "}
                  {formatText(event.judge)}
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {t("admin.shows.manage.results.dogs")}:
                  </span>{" "}
                  {event.dogCount}
                </p>
              </div>
              {isSelected ? (
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.shows.manage.results.selected")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    />
  );
}
