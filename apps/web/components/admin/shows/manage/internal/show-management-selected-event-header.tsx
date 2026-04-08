"use client";

import { Button } from "@/components/ui/button";
import type { ManageShowEvent } from "../show-management-types";

function formatText(value: string): string {
  const normalized = value.trim();
  return normalized || "-";
}

export function ShowManagementSelectedEventHeader({
  selectedEvent,
  isEditDisabled,
  onEdit,
}: {
  selectedEvent: ManageShowEvent;
  isEditDisabled: boolean;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Selected event</p>
          <h2 className="text-lg font-semibold">{selectedEvent.eventPlace}</h2>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p>
            <span className="text-muted-foreground">Date:</span>{" "}
            {formatText(selectedEvent.eventDate)}
          </p>
          <p>
            <span className="text-muted-foreground">City:</span>{" "}
            {formatText(selectedEvent.eventCity)}
          </p>
          <p>
            <span className="text-muted-foreground">Event:</span>{" "}
            {formatText(selectedEvent.eventName)}
          </p>
          <p>
            <span className="text-muted-foreground">Type:</span>{" "}
            {formatText(selectedEvent.eventType)}
          </p>
          <p>
            <span className="text-muted-foreground">Organizer:</span>{" "}
            {formatText(selectedEvent.organizer)}
          </p>
          <p>
            <span className="text-muted-foreground">Judge:</span>{" "}
            {formatText(selectedEvent.judge)}
          </p>
          <p>
            <span className="text-muted-foreground">Dogs:</span>{" "}
            {selectedEvent.entries.length}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onEdit} disabled={isEditDisabled}>
          Edit event
        </Button>
      </div>
    </>
  );
}
