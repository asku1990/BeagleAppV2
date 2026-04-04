"use client";

import { Button } from "@/components/ui/button";
import type { ManageShowEvent } from "../show-management-types";

export function ShowManagementSelectedEventHeader({
  selectedEvent,
  isEventDirty,
  isEditDisabled,
  onEdit,
}: {
  selectedEvent: ManageShowEvent;
  isEventDirty: boolean;
  isEditDisabled: boolean;
  onEdit: () => void;
}) {
  return (
    <>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Selected event</p>
        <h2 className="text-lg font-semibold">{selectedEvent.eventPlace}</h2>
        <p className="text-sm text-muted-foreground">
          {selectedEvent.eventDate} · {selectedEvent.eventName}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onEdit} disabled={isEditDisabled}>
          {isEventDirty ? "Edit event (unsaved)" : "Edit event"}
        </Button>
      </div>
    </>
  );
}
