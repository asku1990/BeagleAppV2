"use client";

import { Button } from "@/components/ui/button";
import type { ManageShowEvent } from "../show-management-types";

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
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Selected event</p>
        <h2 className="text-lg font-semibold">{selectedEvent.eventPlace}</h2>
        <p className="text-sm text-muted-foreground">
          {selectedEvent.eventDate} · {selectedEvent.eventName}
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onEdit} disabled={isEditDisabled}>
          Edit event
        </Button>
      </div>
    </>
  );
}
