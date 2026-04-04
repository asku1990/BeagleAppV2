"use client";

import type { AdminShowEventSummary } from "@beagle/contracts";
import { AdminRowActionsMenu } from "@/components/admin";
import { ListingResponsiveResults } from "@/components/listing";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatEventLocation(event: AdminShowEventSummary): string {
  const parts = [event.eventDate, event.eventCity].filter(
    (value) => value.trim().length > 0,
  );

  return parts.join(" · ");
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
              <th className="px-2 py-2">Place</th>
              <th className="px-2 py-2">Date / city</th>
              <th className="px-2 py-2">Event</th>
              <th className="px-2 py-2">Dogs</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isSelected = event.showId === selectedEventId;
              return (
                <tr
                  key={event.showId}
                  className={cn(
                    "border-b align-top",
                    isSelected ? "bg-muted/40" : undefined,
                  )}
                >
                  <td className="px-2 py-2 font-medium">{event.eventPlace}</td>
                  <td className="px-2 py-2">{formatEventLocation(event)}</td>
                  <td className="px-2 py-2">{event.eventName}</td>
                  <td className="px-2 py-2">{event.dogCount}</td>
                  <td className="px-2 py-2">
                    <AdminRowActionsMenu
                      triggerAriaLabel="More event actions"
                      actions={[
                        {
                          id: "open",
                          label: isSelected ? "Selected" : "Open event",
                          onSelect: () => onSelectEvent(event.showId),
                          disabled: isSelected,
                        },
                      ]}
                    />
                  </td>
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
            className={cn(isSelected ? "ring-1" : undefined)}
          >
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{event.eventPlace}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventLocation(event)}
                  </p>
                </div>
                {isSelected ? (
                  <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    Selected
                  </span>
                ) : null}
              </div>
              <p className="text-sm">{event.eventName}</p>
              <p className="text-sm text-muted-foreground">
                {event.dogCount} dogs
              </p>
              <AdminRowActionsMenu
                triggerAriaLabel="More event actions"
                actions={[
                  {
                    id: "open",
                    label: isSelected ? "Selected" : "Open event",
                    onSelect: () => onSelectEvent(event.showId),
                    disabled: isSelected,
                  },
                ]}
              />
            </CardContent>
          </Card>
        );
      })}
    />
  );
}
