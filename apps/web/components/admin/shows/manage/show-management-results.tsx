"use client";

import type React from "react";
import type { AdminShowEventSummary } from "@beagle/contracts";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
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
  function handleEventSelect(showId: string) {
    onSelectEvent(showId);
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No matches. Try another place, dog, or date.
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
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Place</th>
              <th className="px-2 py-2">City</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Event</th>
              <th className="px-2 py-2">Organizer</th>
              <th className="px-2 py-2">Judge</th>
              <th className="px-2 py-2">Dogs</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isSelected = event.showId === selectedEventId;
              return (
                <tr
                  key={event.showId}
                  onClick={() => handleEventSelect(event.showId)}
                  onKeyDown={(keyboardEvent) => {
                    if (!isActivationKey(keyboardEvent)) {
                      return;
                    }

                    keyboardEvent.preventDefault();
                    handleEventSelect(event.showId);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${event.eventPlace} event`}
                  aria-selected={isSelected}
                  className={cn(
                    "border-b align-top cursor-pointer transition-colors focus-visible:bg-muted/40 focus-visible:outline-none",
                    isSelected ? "bg-muted/40" : "hover:bg-muted/20",
                  )}
                >
                  <td className="px-2 py-2">{event.eventDate}</td>
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
            aria-label={`Select ${event.eventPlace} event`}
            aria-selected={isSelected}
            onClick={() => handleEventSelect(event.showId)}
            onKeyDown={(keyboardEvent) => {
              if (!isActivationKey(keyboardEvent)) {
                return;
              }

              keyboardEvent.preventDefault();
              handleEventSelect(event.showId);
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
                    Selected
                  </span>
                ) : null}
              </div>
              <div className="grid gap-1 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {event.eventDate}
                </p>
                <p>
                  <span className="text-muted-foreground">Place:</span>{" "}
                  {event.eventPlace}
                </p>
                <p>
                  <span className="text-muted-foreground">City:</span>{" "}
                  {formatText(event.eventCity)}
                </p>
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {formatText(event.eventType)}
                </p>
                <p>
                  <span className="text-muted-foreground">Event:</span>{" "}
                  {event.eventName}
                </p>
                <p>
                  <span className="text-muted-foreground">Organizer:</span>{" "}
                  {formatText(event.organizer)}
                </p>
                <p>
                  <span className="text-muted-foreground">Judge:</span>{" "}
                  {formatText(event.judge)}
                </p>
                <p>
                  <span className="text-muted-foreground">Dogs:</span>{" "}
                  {event.dogCount}
                </p>
              </div>
              {isSelected ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Selected
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    />
  );
}
