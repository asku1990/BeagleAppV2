"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ManageShowEvent } from "./show-management-types";

type ShowManagementSearchPanelProps = {
  events: ManageShowEvent[];
  selectedEventId: string | undefined;
  query: string;
  onQueryChange: (value: string) => void;
  onSelectEvent: (eventId: string) => void;
};

export function ShowManagementSearchPanel({
  events,
  selectedEventId,
  query,
  onQueryChange,
  onSelectEvent,
}: ShowManagementSearchPanelProps) {
  return (
    <div className="space-y-4">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search by place, dog, registration number, or judge"
        aria-label="Search shows"
      />
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches. Try another place, dog, or date.
          </p>
        ) : (
          events.map((event) => {
            const isSelected = event.id === selectedEventId;
            return (
              <Button
                key={event.id}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className="h-auto w-full justify-start px-4 py-4 text-left"
                onClick={() => onSelectEvent(event.id)}
              >
                <div className="flex w-full flex-col items-start gap-1">
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="text-left">
                      <p className="font-medium">{event.eventPlace}</p>
                      <p className="text-sm opacity-80">
                        {event.eventDate} · {event.eventCity}
                      </p>
                    </div>
                    <span className="text-xs opacity-80">
                      {event.entries.length} dogs
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{event.eventName}</p>
                </div>
              </Button>
            );
          })
        )}
      </div>
    </div>
  );
}
